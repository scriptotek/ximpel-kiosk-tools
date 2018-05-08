/**
 * IdleTracker for Ximpel will reset Ximpel to its initial state after some
 * idle time, measured as time without any clicks/taps or mouse moves.
 *
 * Basic usage:
 *
 *    var app = new ximpel.XimpelApp( ... );
 *    IdleTracker.setup({
 *        mousemove: false,   // don't track mousemove events
 *        limit: 120          // 120 second idle time limit before the app is reset
 *    });
 *    IdleTracker.setXimpelApp(app);
 *
 * Idle time limits can also vary depending on the Ximpel content being displayed
 * by specifying a list of `rules` that match the 'id' attributes of the Ximpel subjects.
 * A use case is if you have some videos that are longer than the default idle time limit.
 * The user might watch the whole video without generating any activity measure.
 *
 * Example: Set the idle time limit to 300 seconds for all Ximpel subjects having
 * an 'id' attribute starting with "video:" (note that the pattern is a regexp):
 *
 *    IdleTracker.setup({
 *      mousemove: false,
 *      limit: 120,
 *      rules: [
 *        {
 *          pattern: /^video:/,
 *          limit: 300
 *        }
 *      ]
 *    });
 *
 * Alternatively, the timer can be paused altogether by setting `pause: true`.
 * Then the timer will continue (from zero) once the Ximpel subject ends.
 *
 *    IdleTracker.setup({
 *      mousemove: false,
 *      limit: 120,
 *      rules: [
 *        {
 *          pattern: /^video:/,
 *          pause: true
 *        }
 *      ]
 *    });
 *
 * This is free and unencumbered software released into the public domain.
 * For more information, please refer to <http://unlicense.org>
 */
var IdleTracker = (function () {

    var app;

    // Default options
    var options = {
        limit: 600,        // Timeout in seconds
        rules: [],         // Special timeouts for Ximpel content
        tickInterval: 1,   // Number of seconds between each check
        click: true,       // Whether to reset on 'click' events
        mousemove: true,   // Whether to reset on 'mousemove' events
        debug: false,      // Whether to log debug messages to the browser console
        app: app,          // Reference to a XimpelApp object
    };
    var timer = null;
    var idleTime = 0;
    var currentSubject = null;
    var analytics = null;

    /**
     * Simple throttle
     */
    function throttle (func, msecs) {
        var inThrottle;
        return function () {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function(){ inThrottle = false; }, msecs);
            }
        };
    }

    /**
     * Log a debug message.
     */
    function log (msg) {
        if (options.debug) {
            console.log('[IdleTracker] ' + msg);
        }
    }

    /**
     * Stop the timer and reset the idle time to zero.
     */
    function stop () {
        if (timer) {
            clearTimeout(timer);
            timer = null;
            idleTime = 0;
        }
    }

    /**
     * Update the idle time and check if it has surpassed the idle time limit.
     */
    function tick () {
        clearTimeout(timer);  // just in case
        var localLimit = options.limit;
        var timerIsPaused = false;
        options.rules.forEach(function(rule) {
            if (currentSubject && currentSubject.match(rule.pattern)) {
                localLimit = rule.limit;
                if (rule.pause) {
                    timerIsPaused = true;
                }
            }
        });
        if (timerIsPaused) {
            log('Timer is paused');
            timer = setTimeout(tick, options.tickInterval * 1000);
            return;
        }
        var timeLeft = localLimit - idleTime;
        if (timeLeft <= 0) {
            log('Waited ' + idleTime + ' of ' + localLimit + ' seconds, resetting app.');
            resetApp();
        } else {
            log('Waited ' + idleTime + ' of ' + localLimit + ' seconds.');
            timer = setTimeout(tick, options.tickInterval * 1000);
        }

        // Update idle time
        idleTime += options.tickInterval;
    }

    /**
     * Reset the Ximpel app to its initial state.
     */
    function resetApp () {

        if (analytics) {
            analytics.stopSession('timeout');
        }

        stop();

        // Workaround for iframe not being removed by Ximpel. Note: This should really be fixed in the Ximpel core,
        // or perhaps the whole "url:" feature should be removed?
        if (options.app && $('.urlDisplay').length) {
            // Note: We do *not* remove all iframe elements, since that would also remove youtube videos,
            // which are already garbage collected correctly by Ximpel.
            $('.urlDisplay').remove();
            // app.ximpelPlayer.resume();
        }

        setTimeout(function() {
            options.app.stopPlayer();
            options.app.startPlayer();
        });
    }

    /**
     * Called whenever some activity is measured. Resets the idle time and starts
     * the timer if not started already.
     */
    function onActivity () {
        if (timer) {
            // Resetting
            clearTimeout(timer);
            timer = null;
            log('Resetting timer');
        } else {
            log('Starting timer');
        }
        idleTime = 0;
        tick();
    }

    // No need to call onActivity for *every* event. Only call it it's been
    // some time (1000 msecs) since last time.
    var onActivityThrottled = throttle(onActivity, 1000);

    /**
     * When an iframe is opened, we need to subscribe to the events of that window. We will listen
     * to both touch and mouse events.
     */
    function onIframeOpen (data) {
        if (data.$iframe && data.$iframe[0] && data.$iframe[0].contentWindow) {
            addEventListeners(data.$iframe[0].contentWindow);
        } else {
            console.warn('[IdleTracker] Cannot attach to iframe, possibly due to it being cross-domain.');
        }
    }

    /**
     * Track subject changes in Ximpel
     */
    function onSubjectChanged (data) {
        currentSubject = data.subjectId;
        log('Ximpel subject changed to ' + currentSubject);
    }

    /**
     * Remove all event listeners.
     */
    function removeEventListeners(window) {
        log('Removing event listeners for window');

        window.removeEventListener( 'mousemove', onActivityThrottled, { passive: true, capture: true } );
        window.removeEventListener( 'mousedown', onActivityThrottled, { passive: true, capture: true } );
        window.removeEventListener( 'touchstart', onActivityThrottled, { passive: true, capture: true } );

        if (options.app && options.app.ximpelPlayer && options.app.ximpelPlayer.removeEventHandler) {
            // Subscribe to 'swipe' events from Ximpel
            options.app.ximpelPlayer.removeEventHandler( 'swipe', onActivityThrottled );

            // Subscribe to 'subject_playing' events from Ximpel
            options.app.ximpelPlayer.removeEventHandler( 'subject_playing', onSubjectChanged );

            // When an iframe is opened, we need to subscribe to the events of its window.
            options.app.ximpelPlayer.removeEventHandler( 'iframe_open', onIframeOpen );
        }
    }

    /**
     * Listen to various events in order to track activity.
     */
    function addEventListeners (window) {
        log('Registering event listeners for window');

        if (options.mousemove) {
            window.addEventListener( 'mousemove', onActivityThrottled, { passive: true, capture: true } );
        }

        if (options.click) {
            // We listen to 'mousedown' and 'touchstart' rather than 'click' since these
            // also cover drags.
            window.addEventListener( 'mousedown', onActivityThrottled, { passive: true, capture: true } );
            window.addEventListener( 'touchstart', onActivityThrottled, { passive: true, capture: true } );
        }

        if (options.app) {
            // Subscribe to 'swipe' events from Ximpel
            options.app.ximpelPlayer.addEventHandler( 'swipe', onActivityThrottled );

            // Subscribe to 'subject_playing' events from Ximpel
            options.app.ximpelPlayer.addEventHandler( 'subject_playing', onSubjectChanged);

            // When an iframe is opened, we need to subscribe to the events of its window.
            options.app.ximpelPlayer.addEventHandler( 'iframe_open', onIframeOpen );
        }
    }

    addEventListeners(window);

    /**
     * Public interface
     */
    return {

        /**
         * Pass in config
         */
        configure: function (args) {

            // To avoid duplicates, we remove any event listeners first
            removeEventListeners(window);

            args = args || {};
            Object.keys(options).forEach(function(key) {
                if (args[key] !== undefined) {
                    options[key] = args[key];
                }
            });

            // Setup listeners again since options may now have changed.
            addEventListeners(window);
        },

        /**
         * Set a reference to the Analytics/Microticks object, so we can subscribe to
         * its events. This is optional.
         */
        setAnalytics: function (obj) {
            analytics = obj;
        },

        stop: stop,
        resetApp: resetApp,
    };

})();
