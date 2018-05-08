// polyfills.js
// Register any polyfills here (ie. functionality that is expected to be 
// supported natively by the browser but isnt).

// ############################################################################

// Polyfill for: console.log() console.debug() console.warn() console.error()
// The console is not supported by all browsers, so we create a polyfill for
// all the console methods that we use for logging.
if( !console ){
  console = {
        log: function(){},
        debug: function(){},
        warn: function(){},
        error: function(){}
    };
}

// ############################################################################

// Polyfill for: Object.keys()
// Object.keys is an ECMAScript 5 feature which lacks some browser support.
// It returns an array containing an object's own properties (so not the 
// properties of its prototype). Below is a polyfill to include the same
// functionality for older browsers that do not natively support it.
if ( ! Object.keys ){
	Object.keys = function( obj ){
		if( obj !== Object( obj ) ){
  		   ximpel.error('Object.keys() called on a non-object');
		}
		var properties=[], property;
		for( property in obj ){
			if( Object.prototype.hasOwnProperty.call( obj, property ) ){
				keys.push( property );
			}
		}
		return keys;
	}
}

// ############################################################################

// Polyfill for Array.prototype.forEach()
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if( !Array.prototype.forEach ){
    Array.prototype.forEach = function( callback, thisArg ){
        var T, k;
        if( this == null ){
            throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while ( k < len ){
            var kValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if( k in O ){

                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[k];

                // ii. Call the Call internal method of callback with T as the this value and
                // argument list containing kValue, k, and O.
                callback.call( T, kValue, k, O );
            }
            
            // d. Increase k by 1.
            k++;
        }
    // 8. return undefined
    };
}

// ############################################################################

// Polyfill for: Array.filter()
if( !Array.prototype.filter ){
    Array.prototype.filter = function( func /*, thisp */ ){
        "use strict";
        if( this == null ){
            throw new TypeError();
        }

        var t = Object( this );
        var len = t.length >>> 0;
        if( typeof func != "function" ){
            throw new TypeError();
        }

        var res = [];
        var thisp = arguments[1];
        for( var i=0; i<len; i++ ){
            if( i in t ){
                var val = t[i]; // in case func mutates this
                if( func.call( thisp, val, i, t ) ){
                    res.push( val );
                }
            }
        }
        return res;
    };
}

// ############################################################################

// A polyfill for Date.now() function
if( !Date.now ){
    Date.now = function(){ 
        return new Date().getTime();
    }
}


// ximpel.js
// This file defines the main ximpel namespace. Every property/method directly attached to the ximpel
// object is globally accessible because the ximpel object stored in a global variable. The ximpel object
// can be considered as the global namespace for XIMPEL. This way there will only be one XIMPEL variable
// in the global namespace.
// ########################################################################################################################################################

// Define the namespace for ximpel. This is where all object constructors get attached to, as well as
// any other properties that are needed by ximpel.
var ximpel = {};


// An object to which all media type definitions will be attached.
ximpel.mediaTypeDefinitions = {};


// Each media type has a MediaTypeRegistration() object with meta data about that media type. The meta-data
// includes information such as the tag-name used in the playlist, the allowed children and attributes and
// a pointer to the constructor for that media type. These registration objects are stored ximpel.availableMediaTypes. 
// To construct an instance of a media type called 'video' you can do: 
// 		var videoInstance = new ximpel.availableMediaTypes['video'].constructor();
// Note that this property is attached to the global ximpel namespace. So it can be accessed from anywhere.
ximpel.availableMediaTypes = {};


// A number of tags are supported natively by ximpel in the playlist and config files. 
// These tags cannot be used as tags for custom media types.
ximpel.ximpelTags = ['ximpel', 'playlist', 'subject', 'media', 'description','score', 'variable', 'config', 'leadsTo', 'sequence', 'parallel', 'overlay', 'question', 'questions', 'option', 'source'];


// Define the log prefix for the custom log functions. This will be shown as prefix in a log message when doing ximpel.log();
ximpel.LOG_PREFIX = '[XIMPEL] '


// Here we define a default html element for the ximpel player. All media will be attached to this element.
// Defining it here is a temporary solution, eventually it should be passed somehow (as an arguemnt to ximpelApp or in the playlist file)
ximpel.DEFAULT_PLAYER_ELEMENT = 'ximpel_player';


// Get the jquery wrapped html element that corresponds to the 'specifiedElement' argument.
// If the element is a string that corresponds to the id of an html element, that element is returned as a jquery wrapper.
// If the specified element is a DOM element then a jquery object is returned that wraps the given DOM element.
// If the specified element is a jquery object that matches exactly one DOM element, that jquery wrapper is returned.
// If the specified element does not specify a non ambigious html element, then false is returned.
ximpel.getElement = function( specifiedElement ){
	if( !specifiedElement ){
		// no specified element argument has been passed, return false: no such element.
		return false;
	} else if( typeof specifiedElement === 'string' || specifiedElement instanceof String ){
		// The specifiedElement argument is a string, if the string is a valid HTML element ID then return that element (jquery wrapped).
		var $el = $('#'+specifiedElement);

		// Check if the jquery obj matches exactly one DOM element, if so we return it.
		if( $el.length === 1 ){
			return $el;
		}
	} else if( ximpel.isElement( specifiedElement) ){
		// The specifiedElement argument is a DOM element, wrap it as jquery and return it.
		return $(specifiedElement);
	} else if( ximpel.isJQueryObject( specifiedElement ) && specifiedElement.length === 1 ){
		// The specified element is a jquery object that matches exactly one html element. Return it...
		return specifiedElement;
	}

	// No (valid) unambigious element was specified, so we return false.
	return false;
}


// wrapInJquery wraps jquery around a DOM element if needed. When it already is a jquery object then this does nothing.
// Note: rewrapping a jquery object that is already a jquery object, does not do harm but it is claimed that wrapping only
// when needed is 30 or more percent faster then just blindly rewrapping the object as jquery.
ximpel.wrapInJquery = function( obj ){
	return (obj instanceof jQuery) ? obj : $( obj );
}


// Returns true of the given obj is a html DOM element and false otherwise.
ximpel.isElement = function( obj ){
	return obj instanceof HTMLElement;
}


// Returns true of the given obj is a jquery object and false otherwise.
ximpel.isJQueryObject = function( obj ){
	return obj instanceof jQuery;
}


// A function factory that returns logging functions that log information in different ways. 
// For example logging a message as error or as a debug message. 
// @param logFunc - The function used for logging.
// @param logPrefix - the prefix shown in front of each log line.
// @param logType - the logType shown as part of the log line (ie. info, warning, error, etc)
ximpel.logFunctionFactory = function( logFunc, logPrefix, logType ){
	return function( output ){
		if( ximpel.isObject( output ) ){
			logFunc( output );
		} else{
			logFunc( logPrefix + "-" + logType + "- " + output );
		}
	}
}


// We use the logFunctionFactory() to create ximpel specific logging functions. The bind()
// calls are  needed because the console functions expect the this keyword to refer to the 
// console object. We use these ximpel specific logging functions so that it is obvious that
// an error or log information belongs to the Ximpel application.
ximpel.error = 	ximpel.logFunctionFactory( console.error.bind(console), ximpel.LOG_PREFIX, "ERROR" );
ximpel.warn = 	ximpel.logFunctionFactory( console.warn.bind(console), ximpel.LOG_PREFIX, "WARNING" );
ximpel.debug = 	ximpel.logFunctionFactory( console.debug.bind(console), ximpel.LOG_PREFIX, "DEBUG" );
ximpel.log = 	ximpel.logFunctionFactory( console.log.bind(console), ximpel.LOG_PREFIX, "INFO" );


// Find out if a variable is an object.
ximpel.isObject = function( obj ){
	return obj === Object( obj );
}







ximpel.filterArrayOfObjects = function( arrayOfObjects, property, value ){
	var filteredArray = arrayOfObjects.filter( function( obj ){
		return obj[property] === value;
	});
	return filteredArray;
}






// This method takes a MediaTypeRegistration() object as an argument. If the registration is a valid registration,
// then the media type registration object will be stored in ximpel.avilableMediaTypes[mediaTypeId]. The 
// registration object contains required information such as a pointer to the constructor function to create
// instances of the media type and information required for the parser (tagnames, allowed child-tags, allowed attributes)
// A registration is valid if:
// - It has a mediaTypeId (ie. the tagname to be used in the playlist file).
// - The mediaTypeId is not equal to one of the native ximpel tags (such as <score> or <media>.
// - The mediaTypeId is not used by another mediaType (if it is then the last registration will fail)
ximpel.registerMediaType = function( mediaTypeRegistrationObject ){
	// Make sure the media type has its 'mediaTypeId' property set.
	if( ! mediaTypeRegistrationObject.hasOwnProperty('mediaTypeId') ){
		ximpel.warn('Media type registration failed! The media type registration object has no "mediaTypeId" property!');
		return false;
	}
	// Make sure that the media type does not use a tag-name that is already part of the native ximpel XML tags.
	var forbiddenTags = ximpel.ximpelTags;
	if( $.inArray( mediaTypeRegistrationObject.mediaTypeId, forbiddenTags ) > -1 ){
		ximpel.warn('Media type registration failed! The media type uses a tag-name ('+mediaTypeRegistrationObject.mediaTypeId+') that is already in use by ximpel!');
		return false;
	}
	// Make sure that the mediaTypeId of the media type has not already been used by another media type.
	var registeredMediaTypeNames = Object.getOwnPropertyNames( ximpel.availableMediaTypes );
	if( $.inArray( mediaTypeRegistrationObject.mediaTypeId, registeredMediaTypeNames ) > -1 ){
		ximpel.warn('Media type registration failed! The media type uses a \'mediaTypeId\' (\'' + mediaTypeRegistrationObject.mediaTypeId + '\') that is already used by another media type.');		
	}

	ximpel.availableMediaTypes[mediaTypeRegistrationObject.mediaTypeId] = mediaTypeRegistrationObject;
}
ximpel.View = function(){
	// This View() object offers some common functionality that is shared between all views. The View() object is meant to serve as the prototype
	// for other objects which implement the specific details of the view. For instance the prototype of the OverlayView() is set to: new ximpel.View(); 
	// As there will be many instances of OverlayView() and each instance has the same View() prototype, this View() object should not store any
	// instance specific data on itself. Whenever one of the methods of the View() stores something by doing:
	//		this.propertyName = value;
	// the 'this' keyword will not refer to the View() itsself but will always refer to a "child" object which has a View() object as its prototype.
	// ie. the this keyword will point to the OverlayView() instance and not to the View() object.
	// This is because the method is always called via the OverlayView instance and thus will the 'this' keyword be bound to that object.
}
ximpel.View.prototype.RENDER_EVENT = 'view_render';
ximpel.View.prototype.ATTACH_EVENT = 'view_attach';
ximpel.View.prototype.DETACH_EVENT = 'view_detach';
ximpel.View.prototype.DESTROY_EVENT = 'view_destroyed';


// The init() function must be called at the top of the constructor of the object that has an instance of this View() object as its prototype.
// So for example if you implement a OverlayView() class then in the constructor of that class you must call this.init() at the top. Passing
// the model and optionally an element in which the view is rendered as arguments.
ximpel.View.prototype.init = function( model, el ){
	// Create a publish subscribe object used by View() to register callback functions  for certain events and to trigger 
	// the callbacks when those events happen. Note that since this method is used in the .init() method (which is called by a
	// child instance of this view class), the 'this' keyword will point to that child instance and thus the pubSub will be only 
	// for that child instance and not all child instances.

	this.pubSub = new ximpel.PubSub();

	// The el property is the view's actual DOM element. This element is being appeneded to the DOM in order to make it visible on the page.
	el = el || $( document.createElement('div') );

	// If a non-jquery wrapped object was passed then wrap it as a jquery element.
	this.$el = ximpel.wrapInJquery( el );

	// The model on which to base the rendering of the view 
	this.model = model;
}


// The render() method is the method that should be called to render the view. It calls the renderView() method on the "child" object
// which is the object that the 'this' keyword points to. This means that each child object should implement the renderView() method.
// So for example if we have an OverlayView() class which has a new ximpel.View() as its prototype then we do:
// 		var overlayView = new ximpel.OverlayView(...);
// 		overlayView.render();
// in order to render the view. A newParentElement can be specified as an argument. By doing so, the view will be detached from any DOM 
// element that it is currently attached to and then re-attached to the newParentElement.
// The render() method throws a RENDER_EVENT, callback functions can be registered to be called when such an event happens by using the
// onRender() method: overlayView.onRender( callbackFunc );
// newParentElement must be a jquery object.
ximpel.View.prototype.render = function( $newParentElement ){
	if( this.renderView ){
		this.renderView( $newParentElement ); 
	}
	
	// If a new parent is specified then detach the view and re-attach it to the specified parent element.
	var $currentParentElement = this.$el.parent();
	if( $newParentElement && $currentParentElement[0] !== $newParentElement[0] ){
		this.detach();
		this.attachTo( $newParentElement );
	}

	// Throw a render event, causing all callbacks registered with onRender() to be called.
	this.pubSub.publish( this.RENDER_EVENT );
	return this;
}

// The destroy method removes the DOM-element of the view from the DOM. Additionally it sets all data of the view to NULL. 
// If the child object has a function called destroyView() this will be called first. After the destroyView() method is 
// finished the element is removed from the DOM if it is not already and then all data is NULL'ED.
ximpel.View.prototype.destroy = function(){
	// First call the more specific destroy function if it has been overwritten.
	if( this.destroyView && typeof this.destroyView === "function" ){
		this.destroyView();
	}

	// If the the this.$el hasnt been unset yet, then do it now.
	if( this.$el ){
		this.$el.remove();
	}
	this.$el = null;
	this.model = null;

	// Throw a destroy event, causing all callbacks registered with onDestroy() to be called.
	// This is only thrown if the child's destroyView() method has not already unset the pubSub property.
	if( this.pubSub ){
		this.pubSub.publish( this.DESTROY_EVENT );
	}
	this.pubSub = null;

	return;
}

// The attachTo method is used to attach the view's DOM element to another parent DOM element.
ximpel.View.prototype.attachTo = function( elementToAttachTo ){
	// jQuery's appendTo moves the element on which it is called to the parent element specified in its argument.
	this.$el.appendTo( elementToAttachTo );

	// Throw a attach event, causing all callbacks registered with onAttach() to be called.
	this.pubSub.publish( this.ATTACH_EVENT );
	return this;
}

// The detach method detaches the view's DOM element from the DOM. This does not delete the element it just makes sure
// it is not part of the DOM tree anymore and as such it is not visible.
ximpel.View.prototype.detach = function(){
	this.$el.detach();

	// throw a detach event, causing all callbacks registered with onDetach() to be called.
	this.pubSub.publish( this.DETACH_EVENT );
	return this;
}

// This allows the child object to register a callback for when the view's DOM element is clicked once. The callback function
// will only be called on the first click, after that the registered callback function is removed.
ximpel.View.prototype.onOneClick = function( callback ){
	this.$el.one('click', callback );
	return this;
}

// This allows the child object to register a callback for when the view's DOM element is clicked. The callbacks are called
// for each click on the view's DOM element.
ximpel.View.prototype.onClick = function( callback ){
	this.$el.click( callback );
	return this;
}

// This allows the child object to register a callback for when the view is rendered.
ximpel.View.prototype.onRender = function( callback ){
	this.pubSub.subscribe( this.RENDER_EVENT, callback );
	return this;
}

// This allows the child object to register a callback for when the view is updated.
ximpel.View.prototype.onUpdate = function( callback ){
	this.pubSub.subscribe( this.UPDATE_EVENT, callback );
	return this;
}

// This allows the child object to register a callback for when the view is attached to a DOM element.
ximpel.View.prototype.onAttach = function( callback ){
	this.pubSub.subscribe( this.ATTACH_EVENT, callback );
	return this;
}
// This allows the child object to register a callback for when the view is detached from a DOM element.
ximpel.View.prototype.onDetach = function( callback ){
	this.pubSub.subscribe( this.DETACH_EVENT, callback );
	return this;
}
ximpel.View.prototype.setElement = function( el ){
	this.$el = el instanceof Jquery ? el : $( el );
	return this;
}
// Models()
// This file contains all the predefined models that XIMPEL uses. These models don't have functionality but they only
// indicate what information is available for specific things. When the parser parses a playlist or config file it translates
// the information from these files to different models. For example a subject is processed and ends up as a SubjectModel 
// containing all information about that subject. The SubjectModel itself contains a SequenceModel which in turn contains MediaModels
// with information about the media items that have to be played. The models often have default values, which may be overwritten by
// the parser.
// ########################################################################################################################################################

// Each model has a Model() object as its prototype. This provides each model with a get() and set() method.
ximpel.Model = function(){
}
ximpel.Model.prototype.get = function( propertyName ){
	return this[propertyName];
}
ximpel.Model.prototype.set = function( propertyName, value ){
	this[propertyName] = value;
	return this;
}

// ############################################################################
// PlaylistModel
// ############################################################################
// The PlaylistModel is the main model containing all information about the playlist.
// This is the model that the Player() object requires to play a presentation.

ximpel.PlaylistModel = function(){
	// An object containing all the subject models. Stored in format:
	// {'subjectId': <subjectModel>, 'subjectId2': <subjectModel>}
	this.subjectModels = {};

	// an array in which all the media models used within the playlist will be stored.
	this.mediaList = []; 

	// The subjectId of the first subject that should be played.
	this.firstSubjectToPlay = "";

	// The variable modifiers on the playlist model are used to initialize variables.
	this.variableModifiers = [];
}
ximpel.PlaylistModel.prototype = new ximpel.Model();



// ############################################################################
// SubjectModel
// ############################################################################
ximpel.SubjectModel = function(){
	// The variable modifiers to apply when the subject is played.
	this.variableModifiers = [];

	// The sequence model that this subject should play (the sequence model contains the list of media items to play)
	this.sequenceModel = null;

	// An array of leadsToModels. These leadsToModels specify the leadsTo value that is used when the subject ends.
	this.leadsToList = [];

	// A key-value object where the key is an event type (like 'swipeleft', 'swiperight') and the value is a leadsToModel
	this.swipeTo = {};
}
ximpel.SubjectModel.prototype = new ximpel.Model();
ximpel.SubjectModel.prototype.description = '';
ximpel.SubjectModel.prototype.subjectId = '';
ximpel.SubjectModel.prototype.getId = function(){
	return this.subjectId;
}



// ############################################################################
// SequenceModel
// ############################################################################
ximpel.SequenceModel = function(){
	// The list of a sequence model may contain MediaModels or ParallelModels
	this.list = [];
}
ximpel.SequenceModel.prototype = new ximpel.Model();
ximpel.SequenceModel.prototype.ORDER_DEFAULT = 'default'; 
ximpel.SequenceModel.prototype.ORDER_RANDOM = 'random';
ximpel.SequenceModel.prototype.order = ximpel.SequenceModel.prototype.ORDER_DEFAULT;

ximpel.SequenceModel.prototype.add = function( item ){
	this.list.push( item );
}



// ############################################################################
// ParallelModel
// ############################################################################
ximpel.ParallelModel = function(){
	// The list of a ParallelModel may contain MediaModels or SequenceModels
	this.list = [];
}
ximpel.ParallelModel.prototype = new ximpel.Model();
ximpel.ParallelModel.prototype.add = function( item ){
	this.list.push( item );
}



// ############################################################################
// MediaModel
// ############################################################################
ximpel.MediaModel = function(){
	// The OverlayModels that are to be played during this media item.
	this.overlays = [];

	// The QuestionModels that are to be played during the media item.
	this.questionLists = [];

	// The custom attributes provided on the media tags (ie. on <video> for example)
	this.customAttributes = {};
    
    // The custom elements provided between the media tags (ie. between <video> and <video> for example)
	this.customElements = [];

	// An array of leadsToModels. These leadsToModels specify the leadsTo value that is used when the media ends.
	this.leadsToList = [];

	// The variable modifiers to apply when the media is played.
	this.variableModifiers = [];
}
ximpel.MediaModel.prototype = new ximpel.Model();
ximpel.MediaModel.prototype.description = "";

// The type of the media that this media item represents (ie. video or audio or picture, etc.). This is filled in by the parser.
ximpel.MediaModel.prototype.mediaType = null;

// How long the media item should play (0 is indefinitely)
ximpel.MediaModel.prototype.duration = 0;

// Defines if the media item should repeat when it comes to its playback end.
ximpel.MediaModel.prototype.repeat = false;

// This is a unique id for each media item (generated in by the parser)
ximpel.MediaModel.prototype.mediaId = null;

ximpel.MediaModel.prototype.getId = function(){
	return this.mediaId;
}



// ############################################################################
// QuestionListModel
// ############################################################################
ximpel.QuestionListModel = function(){
	// When the questionList should start relative to the media item's startTime
	this.startTime = 0;

	// The timelimit of the questions in this question list.
	this.questionTimeLimit = 0;
	
	// The list of questionModels that are part of this question list.
	this.questions = [];

}
ximpel.QuestionListModel.prototype = new ximpel.Model();




// ############################################################################
// QuestionModel
// ############################################################################
ximpel.QuestionModel = function(){
	// The type of the question (determined by the parser)
	this.type = "boolean";

	// The start time of this specific question.
	this.startTime = 0;

	// The timelimit of this specific question.
	this.timeLimit = null;

	// The text of the question
	this.questionText = "";

	// The answer (true or false for boolean questions, or a number for questions with specific options.)
	this.answer = true;

	// A list of QuestionOptionModels that form the choosable options for the question.
	this.options = [];

	// The variable modifiers to apply when the question is answered correctly.
	this.variableModifiers = [];
}
ximpel.QuestionModel.prototype = new ximpel.Model();



// ############################################################################
// QuestionOptionModel
// ############################################################################
ximpel.QuestionOptionModel = function(){
	// the option name is used to reference the option. The answer attribute of the question holds the name of the option.
	this.optionName = "";
	
	// The option text indicates the text to be shown for the option.
	this.optionText = "";
}
ximpel.QuestionOptionModel.prototype = new ximpel.Model();



// ############################################################################
// VariableModifierModel
// ############################################################################
ximpel.VariableModifierModel = function(){
}
ximpel.VariableModifierModel.prototype = new ximpel.Model();
// These specify some constants that define the operations that can be used in a variable modifier.
ximpel.VariableModifierModel.prototype.OPERATION_SET = 'set';
ximpel.VariableModifierModel.prototype.OPERATION_ADD = 'add';
ximpel.VariableModifierModel.prototype.OPERATION_SUBSTRACT = 'substract';
ximpel.VariableModifierModel.prototype.OPERATION_MULTIPLY = 'multiply';
ximpel.VariableModifierModel.prototype.OPERATION_DIVIDE = 'divide';
ximpel.VariableModifierModel.prototype.OPERATION_POWER = 'power';

// The ID of the variable to be modified.
ximpel.VariableModifierModel.prototype.id = '';

// The operation to perform on the variable.
ximpel.VariableModifierModel.prototype.operation = 'set';

// The value to perform the operation with.
ximpel.VariableModifierModel.prototype.value = 0;



// ############################################################################
// ConditionModel
// ############################################################################
ximpel.ConditionModel = function(){
}
ximpel.ConditionModel.prototype = new ximpel.Model();

// A string containing a condition.
ximpel.ConditionModel.prototype.condition = null;



// ############################################################################
// LeadsToModel
// ############################################################################
ximpel.LeadsToModel = function(){
}
ximpel.LeadsToModel.prototype = new ximpel.Model();

// The subjectId 
ximpel.LeadsToModel.prototype.subject = null;

// The condition underwhich that subjectId is used.
ximpel.LeadsToModel.prototype.conditionModel = null;



// ############################################################################
// OverlayModel
// ############################################################################
ximpel.OverlayModel = function(){
	// The variable modifiers to apply when the overlay is clicked.
	this.variableModifiers = [];

	// An array of leadsToModels. These leadsToModels specify the leadsTo value that is used when the overlay is clicked.
	this.leadsToList = [];
}
ximpel.OverlayModel.prototype = new ximpel.Model();
ximpel.OverlayModel.prototype.SHAPE_RECTANGLE = 'rectangle';
ximpel.OverlayModel.prototype.x = 0;
ximpel.OverlayModel.prototype.y = 0;
ximpel.OverlayModel.prototype.waitForMediaComplete = false;
ximpel.OverlayModel.prototype.leadsTo = null;
ximpel.OverlayModel.prototype.startTime = 0;
ximpel.OverlayModel.prototype.duration = 0;
ximpel.OverlayModel.prototype.text = "";
ximpel.OverlayModel.prototype.shape = 'rectangle';
ximpel.OverlayModel.prototype.width = '200px';
ximpel.OverlayModel.prototype.height = '100px';
ximpel.OverlayModel.prototype.side = '150px';
ximpel.OverlayModel.prototype.diameter = '150px';
ximpel.OverlayModel.prototype.textAlign = "center";
ximpel.OverlayModel.prototype.opacity = 0.4;
ximpel.OverlayModel.prototype.hoverOpacity = 0.6;
ximpel.OverlayModel.prototype.backgroundColor = "white";
ximpel.OverlayModel.prototype.hoverBackgroundColor = null; 	// null means the same as the non-hover style.
ximpel.OverlayModel.prototype.textColor = "white";
ximpel.OverlayModel.prototype.hoverTextColor = null;		// null means the same as the non-hover style.
ximpel.OverlayModel.prototype.fontFamily = "Arial";
ximpel.OverlayModel.prototype.hoverFontFamily = null;		// null means the same as the non-hover style.
ximpel.OverlayModel.prototype.fontSize = "50px";
ximpel.OverlayModel.prototype.hoverFontSize = null;			// null means the same as the non-hover style.
ximpel.OverlayModel.prototype.backgroundImage = null;
ximpel.OverlayModel.prototype.description = null;



// ############################################################################
// ConfigModel
// ############################################################################
ximpel.ConfigModel = function(){
}
ximpel.ConfigModel.prototype = new ximpel.Model();
ximpel.ConfigModel.prototype.mediaDirectory = '';
ximpel.ConfigModel.prototype.titleScreenImage = 'assets/ximpel_title_screen.png';
ximpel.ConfigModel.prototype.enableControls = true;
ximpel.ConfigModel.prototype.controlsDisplayMethod = 'overlay';
ximpel.ConfigModel.prototype.showScore = false;
ximpel.ConfigModel.prototype.minimumSwipeVelocity = 0.10;
ximpel.ConfigModel.prototype.minimumSwipeTranslation = 50;

// This extend method allows for extending one ConfigModel with another ConfigModel
// The config model that is being extended gets all values overwritten from the ConfigModel
// that you extend it with.
ximpel.ConfigModel.prototype.extend = function( extendWithConfig ){
	var extendWithPropertyNames = Object.getOwnPropertyNames( extendWithConfig );
	extendWithPropertyNames.forEach( function( propertyName ){
		this[propertyName] = extendWithConfig[propertyName];
	}, this );
}



// ############################################################################
// ConfigModel
// ############################################################################
ximpel.CustomElementModel = function( elementName, elementAttributes ){
	this.elementName = elementName || '';
	this.elementAttributes = elementAttributes || {};
}



// ############################################################################
// XimpelAppModel
// ############################################################################
ximpel.XimpelAppModel = function(){
	this.initialAppWidth = "1080px"; // can be overwritten at the moment the app is created.
	this.initialAppHeight = "720px"; // can be overwritten at the moment the app is created.
	this.$appElement = null;
	this.$parentElement = null;

	this.playlistFile = null;
	this.configFile =null;
	this.ximpelPlayer = null;
 	this.parser = null;
 	this.configModel = new ximpel.ConfigModel();
	this.playlistModel = null;
	this.playlistXmlDocument = null;
	this.configXmlDocument = null;
 	this.filesRequestPromise = null;
	this.playlistRequestPromise = null;
	this.configRequestPromise = 0;
/*	this.enableControls = true;
	this.controlsDisplayMethod = "overlay";*/
	this.appReadyState = null;
	this.playerState = null;

}
ximpel.XimpelAppModel.prototype = new ximpel.Model();
ximpel.XimpelAppModel.prototype.PLAYER_STATE_PLAYING = 'player_state_playing';
ximpel.XimpelAppModel.prototype.PLAYER_STATE_PAUSED = 'player_state_paused';
ximpel.XimpelAppModel.prototype.PLAYER_STATE_STOPPED = 'player_state_stopped';

// XimpelApp()
// XimpelApp is the main object to create XIMPEL players. For each XIMPEL player that you want
// to add on your page you create an instance of XimpelApp. This object can load playlist
// and config files from the server, then ask the parser to parse the XML documents and create
// a playlist that plays the PlaylistModel anc ConfigModel that the parser produced. So
// XimpelApp manages everything to start the player. When it has started the Player() lobject
// does everything.
// ########################################################################################################################################################

ximpel.XimpelApp = function( appId, playlistFile, configFile, options ){
	var options = options || {}; // prevents errors when no options are specified.
	var ximpelAppModel = this.ximpelAppModel = new ximpel.XimpelAppModel();

	// There is one main element to which XIMPEL will attach all DOM elements. This element can 
	// be specified using the "appElement" option, if not specified XIMPEL will create an element.
	// Additionally, you can specify a "parentElement" option. This will cause the main ximpel element
	// (whether you specified one explicitly or one is created) to be attached to that "parentElement".

	// Get the jquery selector for the parent element to which the appElement will be attached (null if not specified)	
	ximpelAppModel.$parentElement = ximpel.getElement( options.parentElement ) || ximpelAppModel.$parentElement;	

	// A unique ID for this specific XIMPEL app (is used for running multiple ximpel apps on one page).
	ximpelAppModel.appId = appId;

	// Create a ximpelApp view, without rendering it yet.	
	this.ximpelAppView = new ximpel.XimpelAppView( ximpelAppModel, options.appElement, options.appWidth, options.appHeight );

	// Will hold the ximpel.Player() object which plays the ximpel presentation.
	this.ximpelPlayer = null;

	// Create a Parser object, which can parse playlist and xml files and create a playlist and config model.
	this.parser = new ximpel.Parser();

	// The path the the playlist file (relative to the page that includes this javascript file).
	ximpelAppModel.playlistFile = playlistFile;

	// The path the the config file (relative to the page that includes this javascript file).
	ximpelAppModel.configFile = configFile;

	// Will hold the retrieved XML content for the specified playlist file.
	ximpelAppModel.playlistXmlDocument = null;

	// Will hold the retrieved XML content for the specified config file.
	ximpelAppModel.configXmlDocument = null;						
	
	// Will hold the config model that is used by this ximpel Player.
	ximpelAppModel.configModel = null;

	// Will hold the playlist model that is used by this ximpel Player.
	ximpelAppModel.playlistModel = null;

	// Will hold a jquery promise object, which indicates whether the ximpel files (playlist/config) have been loaded.
	ximpelAppModel.filesRequestPromise = null;

	// Will hold a jquery promise object, indicating whether specifically the playlist file has been loaded.
	ximpelAppModel.playlistRequestPromise = null;

	// Will hold a jquery promise object, indicating whether specifically the config file has been loaded.
	ximpelAppModel.configRequestPromise = null;

	// This timeout handler is used to set and cancel timeouts for hiding the controls bar.
	ximpelAppModel.hideControlsTimeoutHandler = null;

	// This timeout handler is used to set and cancel timeouts for hiding the mouse cursor.
	ximpelAppModel.hideCursorTimeoutHandler = null;

	// This holds the state of the XIMPEL app. This indicates if the XimpelApp is still loading or not.
	ximpelAppModel.appReadyState = this.APP_STATE_LOADING;

	// this indicates the state of the Player (whether it is playing or paused or stopped.)
	ximpelAppModel.playerState = this.ximpelAppModel.PLAYER_STATE_STOPPED;
}



// The load function does several things:
// - It retrieves the playlist (and config if specified) file from the server.
// - It parses these files, giving back a playlist and config model (ie an in-memory representation of the playlist and config files).
// - It creates a Player object which makes use of these playlist and config models.
// Return value: A jQuery promise object which is resolved when the playlist (and if applicable also the config file) has been loaded.
ximpel.XimpelApp.prototype.load = function( options ){
	var ximpelAppModel = this.ximpelAppModel;
	var options = options || {};
	var autoPlay = options.autoPlay === false ? false : true;

	// First we send a request to load the files from the server.  We get back a jquery promise object and store it.
	ximpelAppModel.filesRequestPromise = this.loadFiles( ximpelAppModel.playlistFile, ximpelAppModel.configFile );

	// Then we specify what will be done when the request finishes (ie. when the promise is resolved). Since this is the first callback
	// function attached to the promise object, it will also be the first to execute. This guarantees that our own callback function is
	// executed before any callback function defined by the caller of .load()
	ximpelAppModel.filesRequestPromise.done( function( playlistStatus, configStatus ){
		// Store the resulting XMLDoc of the playlist file.
		ximpelAppModel.playlistXmlDocument = playlistStatus[0];

		// Store the resulting XMLDoc of the config file if a config file was specified.
		// configStatus[0] may not exist if no config file was specified.
		ximpelAppModel.configXmlDocument = configStatus ? configStatus[0] : null; 

		// We parse the content of the loaded files. parseResult will have the form: {'playlist':<PlaylistModel>, 'config':<configModel>}
		// Even if no config file was specified, there will still be a config model filled with default values for a config model.
		var parseResult = this.parse( ximpelAppModel.playlistXmlDocument, ximpelAppModel.configXmlDocument );
		if( !parseResult ){
			ximpel.error("XimelApp.load(): No XIMPEL player was created because the playlist or config file was invalid.");
			return false;
		}

		// Store the config model and the playlist model.
		ximpelAppModel.playlistModel = parseResult['playlist'];
		ximpelAppModel.configModel = parseResult['config'];

		// We then create a player and pass to it the playlist and config models which will specify what the player will do.
		this.ximpelPlayer = new ximpel.Player( this.getPlayerElement(), parseResult['playlist'], parseResult['config'] );

		// We set the  appReadyState to the ready state to indicate loading is finished and the player is ready.
		this.ximpelAppModel.appReadyState = this.ximpelAppModel.APP_READY_STATE_READY;

		// Register the functions to be executed when the play/pause/stop buttons are clicked.
		this.ximpelAppView.registerPlayHandler( this.startPlayer.bind(this) );
		this.ximpelAppView.registerPauseHandler( this.pausePlayer.bind(this) );
		this.ximpelAppView.registerStopHandler( this.stopPlayer.bind(this) );

		// Render the view (this adds some DOM elements to the main ximpel element, including the controls)
		this.ximpelAppView.render( ximpelAppModel.$parentElement );

		// Tell the player to start playing immediately if autoPlay is true.
		// If its false then the user should click the play button to start playing.
		if( autoPlay === true ){
			this.startPlayer();

			// Update the controls.
			//this.ximpelAppView.renderControls();
		}
	}.bind(this) );

	// We return the "loadFilesRequest" promise object so that the caller of the load() method can also attach callback functions to it.
	return ximpelAppModel.filesRequestPromise;
}



// Load the given playlistFile and configFile (if specified) from the server.
// Return value: a jquery Promise. The promise object is used to keep track of the status of the
// 				 request. Handler functions can be attached to it to react upon the request succeeding or failing.
ximpel.XimpelApp.prototype.loadFiles = function( playlistFile, configFile, options ){
	var ximpelAppModel = this.ximpelAppModel;
	var options = options || {};

	// Make the actual AJAX request for the playlist XML file.
	ximpelAppModel.playlistRequestPromise = this.requestXmlFile( playlistFile ).fail( function( jqXHR, textStatus, errorThrown ){
		ximpel.error("XimpelApp.loadFiles(): Failed to load the playlist file (" + playlistFile + ") from the server or the XML syntax is invalid (HTTP status='" + jqXHR.status + " " + jqXHR.statusText + "', message='" + textStatus + "')");
	}.bind(this) );

	// If a configFile has been specified then also make an ajax request for the config XML file.
	if( configFile ){
		ximpelAppModel.configRequestPromise = this.requestXmlFile( configFile ).fail( function( jqXHR, textStatus, errorThrown ){
			ximpel.error("XimpelApp.loadFiles(): Failed to load the config file (" + configFile + ") from the server or the XML syntax is invalid! (HTTP status='" + jqXHR.status + " " + jqXHR.statusText + "', message='" + textStatus + "')");
		}.bind(this) );
	}

	// $.when() returns a promise that is resolved when both the playlistRequestPromise and the configRequestPromise are resolved.
	// Note that if no config file request was made and thus configRequestPromise is null, configRequest is treated
	// as a resolved promise and thus $.when() will only wait for playlistRequestPromise to resolve.
	// We return the combined jquery Promise object, so that the caller of loadFiles() can attach callback handlers to it.
	return $.when( ximpelAppModel.playlistRequestPromise, ximpelAppModel.configRequestPromise );
}



// Load an xml file with the specified url from the server. 
ximpel.XimpelApp.prototype.requestXmlFile = function( fileUrl, options ){
	var options = options || {};

	var xmlRequest = $.ajax({
		type: "GET",
		url: fileUrl,
		dataType: "xml",
		cache: false // for during development, so that we always get an up-to-date version
	});

	// Return a jquery XHR object (which looks alot like a a jquery Promise object)
	// This can be used to keep track of the status of a request.
	return xmlRequest;
}



// This method takes the playlistXml content and (if it exists) the configXml content and parses it to return
// a PlaylistModel object and a ConfigModel object.
// Return value: an object with format: {'playlist':<PlaylistModel>, 'config':<configModel>}
//               or false if parsing failed.
ximpel.XimpelApp.prototype.parse = function( playlistXml, configXml ){
	var ximpelAppModel = this.ximpelAppModel;
	
	// Tell the parser to parse the playlist and config xml files. 
	var parseResult = this.parser.parse( playlistXml, configXml );

	// parseResult has the form {'playlist': <PlaylistModel>, 'config': <ConfigModel}
	var playlistModel = parseResult['playlist'] || null;
	var configModel = parseResult['config'] || null;

	// If the parser returns something falsy (empty string, null, undefined, false, etc) then the parsing failed.
	if( !playlistModel || !configModel ){
		ximpel.error("XimpelApp.parse(): Failed to parse playlist or config document.");
		return false;
	}

	return parseResult;
}



// Returns the main player element that the player uses to attach DOM elements to. (this is
// not the same as the main ximpel element, the player element is a descendant of the main ximpel element)
ximpel.XimpelApp.prototype.getPlayerElement = function(){
	return this.ximpelAppView.getPlayerElement();
}



// Tell the Player to start playing.
ximpel.XimpelApp.prototype.startPlayer = function(){
	if( this.ximpelAppModel.appReadyState !== this.ximpelAppModel.APP_READY_STATE_READY ){
		ximpel.warn("XimpelApp.startPlayer(): XimpelApp.startPlayer(): cannot start player when app is not ready yet.");
		return;
	} else if( this.ximpelAppModel.playerState !== this.ximpelAppModel.PLAYER_STATE_PAUSED && this.ximpelAppModel.playerState !== this.ximpelAppModel.PLAYER_STATE_STOPPED ){
		ximpel.warn("XimpelApp.startPlayer(): cannot start player when the player is not paused or stopped.");
		return;
	}

	this.ximpelAppModel.playerState = this.ximpelAppModel.PLAYER_STATE_PLAYING;
	this.ximpelPlayer.play();
	this.ximpelAppView.renderControls();
}



// Tell the Player to pause.
ximpel.XimpelApp.prototype.pausePlayer = function(){
	if( this.ximpelAppModel.appReadyState !== this.ximpelAppModel.APP_READY_STATE_READY ){
		ximpel.warn("XimpelApp.pausePlayer(): cannot pause player when app is not ready yet.");
		return;
	} 

	if( this.ximpelAppModel.playerState === this.ximpelAppModel.PLAYER_STATE_PLAYING ){
		this.ximpelAppModel.playerState = this.ximpelAppModel.PLAYER_STATE_PAUSED;
		this.ximpelPlayer.pause();
	} else if( this.ximpelAppModel.playerState === this.ximpelAppModel.PLAYER_STATE_PAUSED ){
		ximpel.warn("XimpelApp.pausePlayer(): cannot pause player when the player is already paused.");
	} else{
		ximpel.warn("XimpelApp.pausePlayer(): cannot pause player when the player is stopped.");
		return;
	}
	this.ximpelAppView.renderControls();
}



// Tell the Player to start playing.
ximpel.XimpelApp.prototype.stopPlayer = function(){
	if( this.ximpelAppModel.appReadyState !== this.ximpelAppModel.APP_READY_STATE_READY ){
		ximpel.warn("XimpelApp.stopPlayer(): cannot stop player when app is not ready yet.");
		return;
	} else if( this.ximpelAppModel.playerState !== this.ximpelAppModel.PLAYER_STATE_PLAYING && this.ximpelAppModel.playerState !== this.ximpelAppModel.PLAYER_STATE_PAUSED ){
		ximpel.warn("XimpelApp.stopPlayer(): cannot stop player when the player is already stopped.");
		return;
	}
	this.ximpelAppModel.playerState = this.ximpelAppModel.PLAYER_STATE_STOPPED;
	this.ximpelPlayer.stop();
	this.ximpelAppView.renderControls();
}



// Returns the width of the main XIMPEL element.
ximpel.XimpelApp.prototype.getAppElementWidth = function(){
	var width = this.ximpelAppModel.$appElement.width();
}



// Returns the height of the main XIMPEL element.
ximpel.XimpelApp.prototype.getAppElementHeight = function(){
	var height = this.ximpelAppModel.$appElement.height();
}

// Player()
// The ximpel.Player object is the object that manages the actual playing of the presentation. 
// The Player() constructor function takes three arguments "playerElement", "playlistModel" and "configModel"
// Based on a PlaylistModel and a ConfigModel object it plays a presentation and displays it in the playerElement.
//
// Public methods:
// play()
// pause()
// stop()
// goTo( <subjectId> )
// getVariable( variableId )
// isPlaying()
// isPaused()
// isStopped()
// getConfigProperty()
// addEventHandler()
// clearEventHandler
// clearEventHandlers()
//
// ########################################################################################################################################################

// TODO:
// - when the player has nothing more to play it just simply stops leaving the player in state "playing".
//   would be better to show an end screen orso. and the buttons should be updated (for example the playbutton should
//   change to a replay button.


ximpel.Player = function( playerElement, playlistModel, configModel ){
	// The player element is the html elment to which all DOM elements will be attached (ie. the media types/overlays/etc.)
	this.$playerElement = ximpel.wrapInJquery( playerElement );

	// The "playlistModel" contains the data that the Player requires to play the presentation.
	// This is a PlaylistModel() object constructed by the parser based on the playlist file.
	this.playlistModel = playlistModel;

	// The "configModel" contains all the data related to configuration settings for the player.
	// This is a ConfigModel() object constructed by the parser based on the config file.
	this.configModel = configModel;

	// Stores the subject models. A subject model can be retrieved like so: this.subjectModels[subjectId].
	this.subjectModels = playlistModel.subjectModels;

	// Stores the ID of the subject that is to be started when the player starts.
	this.firstSubjectModel = this.getFirstSubjectModel();

	// The available media types is an object containing all the mediaTypeRegistration objects. These registrations contain data about the implemented 
	// media types. A mediaTypeRegistration object can be retrieved like: this.availableMediaTypes[<mediaTypeName>]. For instance: availableMediaTypes['video']
	// For the Player the most important data in the registration object is a pointer to the constructor of the media type. A new instance of a media type
	// can be created like this: var videoInstance = new availableMediaTypes['video'].mediaTypeConstructor();
	this.availableMediaTypes = ximpel.availableMediaTypes; 

	// The mediaItems object will contain all the media type instances (ie. it will contain all the Video() objects, Audio() objects, etc.)
	// A media item is refered to by its mediaId, where the mediaId is a property in the mediaModel that is filled by the parser (ie. each 
	// <video>, <audio>, etc. gets a unique ID). Referring to a media item is done like this: this.mediaItems[<mediaId>]  The result is a media
	// instance (for example a Video() object or an Audio() object) on which methods like play(), pause() and stop() can be called.
	// The media instances will be created and added to the mediaItems object by the constructMediaItems() function.
	this.mediaItems = {};

	// Will hold the subjectModel that is currently being played.
	this.currentSubjectModel = null;

	// The pubSub object is used internally by the player for registering event handlers and publishing events to the registered handlers.
	this.pubSub = new ximpel.PubSub();

	// The ximpel player can keep track of variables. Variables can be declared and modified using the <score> or <variable> tag in the playlist.
	this.variables = [];

	// The state of the player (ie. paused/playing/stopped)
	this.state = this.STATE_STOPPED;

	// Each subject contains exactly one main sequenceModel that is to be played. The sequencePlayer plays such a sequeceModel.
	// Note that a sequenceModel itself may contain: media items, other sequence models and parralel models. However, since
	// the ximpel Player always has one main sequence, it can just tell the sequence player to play/pause/stop that main
	// sequence without worrying about how complex that sequence may be.
	this.sequencePlayer = new ximpel.SequencePlayer( this );

	// Add an event handler function for when the sequence player finished playing a sequence. When a sequence has ended
	// because all the items in the sequence have finished playing, the sequence player will trigger this event.
	this.sequencePlayer.addEventHandler( this.sequencePlayer.EVENT_SEQUENCE_END, this.handleSequencePlayerEnd.bind(this) );

	// Propagate iframe open/close events from the MediaPlayer object
	this.sequencePlayer.mediaPlayer.addEventHandler( this.sequencePlayer.mediaPlayer.EVENT_IFRAME_OPEN, function(evt) {
		this.pubSub.publish( this.EVENT_IFRAME_OPEN, evt );
	}.bind(this));
	this.sequencePlayer.mediaPlayer.addEventHandler( this.sequencePlayer.mediaPlayer.EVENT_IFRAME_CLOSE, function(evt) {
		this.pubSub.publish( this.EVENT_IFRAME_CLOSE, evt );
	}.bind(this));

	if (typeof Hammer === 'undefined') {
		ximpel.warn('Hammer is not loaded. Swipe events will not be supported.');
	} else {
		// Add Hammer to handle swipes
		this.mc = new Hammer.Manager( this.$playerElement[0] );

		this.mc.add( new Hammer.Pan() );
		this.mc.on( 'pan', this.onPan.bind(this) );
	}


	// Do some stuff to initialize the player to make it ready for use.
	this.init();
};
ximpel.Player.prototype.STATE_PLAYING = 'state_player_playing';
ximpel.Player.prototype.STATE_PAUSED = 'state_player_paused';
ximpel.Player.prototype.STATE_STOPPED = 'state_player_stopped';
ximpel.Player.prototype.EVENT_PLAYER_END = 'ended';
ximpel.Player.prototype.EVENT_VARIABLE_UPDATED = 'variable_updated';
ximpel.Player.prototype.EVENT_SWIPE = 'swipe';
ximpel.Player.prototype.EVENT_IFRAME_OPEN = 'iframe_open';
ximpel.Player.prototype.EVENT_IFRAME_CLOSE = 'iframe_close';

// Sent when a subject begins to play. The subject model is included as an argument.
ximpel.Player.prototype.EVENT_SUBJECT_PLAYING = 'subject_playing';


// init() initializes the player once when the Player is constructed, but is never called again after that.
ximpel.Player.prototype.init = function(){
	// Create an instance (mediaItem) for each mediaModel (ie. for each media tag present in the the playlist.
	// This fills the this.mediaItems object with media items. A mediaItem can then be returned by doing:
	// this.mediaItem[ mediaModel.mediaId ]
	this.constructMediaItems();

	// This applies all variable modifiers on the playlist model which will initialize the
	// variables with a value. They are stored in: this.variables
	this.applyVariableModifiers( this.playlistModel.variableModifiers );

	// The 'popstate' event is fired when the active history entry changes,
	// that is when the URL changes, due to normal navigation or use of the
	// browser's back/forward functionality.
	// Some browsers (older versions of Chrome + Safari) also emits a
	// popstate event on page load.
	window.onpopstate = this.onWindowHistoryChange.bind(this)

	return this;
}

// When the URL changes, we will start playing the subject with ID matching
// the value of the URL's hash.
ximpel.Player.prototype.onWindowHistoryChange = function(){
	if (this.isStopped()) {
		// If the player is stopped, leave it like that.
		return;
	}

	var subjectId = document.location.hash.substr(1);
	if (!subjectId) {
		// If there's no subject specified, go to the initial subject
		window.location = '#' + this.firstSubjectModel.subjectId;
		return;
	}

	var subjectModel = this.subjectModels[subjectId];

	if( !subjectModel ){
		ximpel.warn("Player: Cannot play a subject with subjectId '" + subjectId + "'. There is no subject with that id.");
		return;
	}

	this.playSubject( subjectModel );
}



// Reset the player to bring it back into a state where it was in when the Player() was just constructed
// and initialized. After this method the player is in a stopped state and the play() method can be called 
// as if it was the first time the player was being played.
ximpel.Player.prototype.reset = function( clearRegisteredEventHandlers ){
	this.state = this.STATE_STOPPED;
	this.currentSubjectModel = null;
	
	// Stop the sequence player. This resets the sequence player to its initial state.
	this.sequencePlayer.stop();

	// Re-initialize variables.
	this.variables = [];
	this.applyVariableModifiers( this.playlistModel.variableModifiers );

	// If specified then the event handlers registered on the Player()'s pubSub will be reset.
	if( clearRegisteredEventHandlers ){
		this.clearEventHandlers(); 		
	}
}



// Start playback of the player. If the player was paused it will resume instead.
ximpel.Player.prototype.play = function(){
	if( this.isPlaying() ){
		ximpel.warn("Player.play(): play() called while already playing.");
		return this;
	} else if( this.isPaused() ){
		this.resume();
		return this;
	}

	// indicate the player is in a playing state.
	this.state = this.STATE_PLAYING;

	// Start playing
	this.onWindowHistoryChange();

	return this;
}



// Start playing a given subjectModel. 
ximpel.Player.prototype.playSubject = function( subjectModel ){
	// Set the specified subjectModel as the current subject model
	this.currentSubjectModel = subjectModel;

	// Each subject contains exactly one sequence model. The sequencePlayer plays such a sequence model. The sequence model itself may contain
	// one or more media models and parrallel models which in turn may contain sequence models again. This playback complexity is all handled by
	// the sequence player so we do not need to worry about that here, we just need to tell the sequence player to start playing the sequence
	// of our subject.
	var sequenceModel = subjectModel.sequenceModel;

	// In the playlist you can define variables/scores to be changed when a subject starts. When you do this
	// the parser will add a variableModifier object and store it in a list of variableModifiers for that subject.
	// When the subject is requested to be played we need to apply these variable modifiers to the variables, This
	// is what we do next.
	this.applyVariableModifiers( subjectModel.variableModifiers );

	// Then finally tell the sequence player to start playing the sequence model of our subject.
	this.sequencePlayer.play( sequenceModel );

	// Publish the subject play event. Any (third party) code that registered a handler for this event using
	// addEventHandler() will have its handler called.
	this.pubSub.publish( this.EVENT_SUBJECT_PLAYING, subjectModel );
}



// Resume playback of the player.
ximpel.Player.prototype.resume = function(){
	// Ignore this resume() call if the player is already in a playing state.
	if( !this.isPaused() ){
		ximpel.warn("Player.resume(): resume() called while not in a paused state.");
		return this;
	}
	// Indicate the player is now in a playing state again.
	this.state = this.STATE_PLAYING;

	// Resume the sequence player.
	this.sequencePlayer.resume();

	return this;
}



// Pause playback of the player.
ximpel.Player.prototype.pause = function(){
	// Ignore this pause() call if the player is not in a playing state.
	if( ! this.isPlaying() ){
		ximpel.warn("Player.pause(): pause() called while not in a playing state.");
		return this;
	}

	// Indicate the player is now in a paused state.
	this.state = this.STATE_PAUSED;

	// Pause the sequence player.
	this.sequencePlayer.pause();

	return this;
}



// Stop playback of the player.
ximpel.Player.prototype.stop = function(){
	// Ignore this stop() call if the player is already in the stopped state.
	if( this.isStopped() ){
		ximpel.warn("Player.stop(): stop() called while already in a stopped state.");
		return this;
	}

	// Indicate the player is now in a stopped state.
	this.state = this.STATE_STOPPED;

	// Resets the player to the point it was in right after its construction and after the init() method.
	// After the reset its ready to be play()'ed again.
	this.reset();

	window.location = '#';

	return this;
}



// Jump to the subject with the given subjectId. This method can be called at anytime from anywhere and
// will cause the player to stop playing what it is playing and jump to the specified subject.
ximpel.Player.prototype.goTo = function( subjectId ){

	if (subjectId == 'back()') {
		// This is a reserved name that we use to go to the previous subject.
		window.history.back();
	} else {
		// Request a transition to the new subject by changing the URL. The actual transition
		// will then be handled by the onWindowHistoryChange method that is called when the
		// popstate event fires.
		window.location = '#' + subjectId;
	}

	return this;
}



// Retrieve a variable with a given id or the default variable if no id is given.
ximpel.Player.prototype.getVariable = function( variableId ){
	return this.variables[variableId];
}



// This method takes an array of variable modifiers and applies each of them. After this method each of the modifiers have been applied.
// See function: applyVariableModifier() for more info on what a variable modifier is.
ximpel.Player.prototype.applyVariableModifiers = function( variableModifiers ){
	$.each( variableModifiers, function( index, value ){
  		var variableModifier = variableModifiers[index];
  		this.applyVariableModifier( variableModifier );
	}.bind(this) );
}



// This function applies one variableModifier. A variable modifier contains:
// - A variable id which indicates the variable to modify
// - An operation that changes the value of the variable
// - The value used by the operation
// For example when: id="score1", operation="add", value="6", the variable modifier adds 6 to the "score1" variable.
ximpel.Player.prototype.applyVariableModifier = function( variableModifier ){
	var currentVariableValue = this.variables[ variableModifier.id ];

	// If the variable to which the modification is applied hasn't been defined yet, then we define it right here to 0.
	if( currentVariableValue === undefined ){
		this.variables[ variableModifier.id ] = 0;
		currentVariableValue = 0;
	}

	// Apply the operation.
	switch( variableModifier.operation ){
		case variableModifier.OPERATION_SET:
			var newValue = variableModifier.value;
			break;
		case variableModifier.OPERATION_ADD:
			var newValue = Number(currentVariableValue) === NaN ? 0 : Number(currentVariableValue);
			newValue += Number( variableModifier.value );
			break;
		case  variableModifier.OPERATION_SUBSTRACT:
			var newValue = Number(currentVariableValue) === NaN ? 0 : Number(currentVariableValue);
			newValue -= Number( variableModifier.value );
			break;
		case variableModifier.OPERATION_MULTIPLY:
			var newValue = Number(currentVariableValue) === NaN ? 0 : Number(currentVariableValue);
			newValue *= Number( variableModifier.value );
			break;
		case variableModifier.OPERATION_DIVIDE:
			var newValue = Number(currentVariableValue) === NaN ? 0 : Number(currentVariableValue);
			newValue /= Number( variableModifier.value );
			break;
		case variableModifier.OPERATION_POWER:
			var newValue = Number(currentVariableValue) === NaN ? 0 : Number(currentVariableValue);
			newValue = Number( Math.pow(newValue, variableModifier.value ) );
			break;
		default:
			var newValue = currentVariableValue;
	}

	// Store the new value of the variable
	this.variables[ variableModifier.id ] = newValue;

	// Publish event
	this.pubSub.publish( this.EVENT_VARIABLE_UPDATED, variableModifier.id );
}



// Return whether the player is playing.
ximpel.Player.prototype.isPlaying = function(){
	return this.state === this.STATE_PLAYING;
}



// Return whether the player is paused.
ximpel.Player.prototype.isPaused = function(){
	return this.state === this.STATE_PAUSED;
}



// Return whether the player is stopped.
ximpel.Player.prototype.isStopped = function(){
	return this.state === this.STATE_STOPPED;
}



// When in the playlist you specify a leadsTo attribute and/or <leadsTo> elements in a subject, overlay or media item then the parser
// will construct a list of leadsToModels and stores it in that subjectModel, overlayModel or mediaModel. Whenever that subject
// finishes, the overlay is clicked or the media item finishes, XIMPEL will look at that list of leadsToModels and based on that
// list it determines which leadsTo value to use next (ie. which subject to play next).
// A LeadsToModel consists of:
// - a subject attribute specifying the subject to play.
// - a condition attribute specifying the condition under which this leadsTo attribute should be used. When
//   no condition is specified its the default leadsTo value that will be used if no other leadsTo model's condition is met.
// The determineLeadsTo() method is the method that determines which of the leadsTo models should be used.
// Note that both the leadsTo attribute and <leadsTo> elements are converted to leadsTo models by the parser so they
// are basically the same, except when using the leadsTo attribute you cannot specify a condition. So this is
// usually the default leadsTo value.
// Return value: the subjectId that should be played next or null if there is no subject to play next.
ximpel.Player.prototype.determineLeadsTo = function( leadsToModels ){
	var defaultLeadsTo = null;

	// Loop over all leadsToModels in the given array and find out which leadsTo value should be used (if any)
	for( var i=0; i<leadsToModels.length; i++ ){
		var leadsToModel = leadsToModels[i];

		// If the current leadsToModel has no condition specified, then its the default leadsToModel.
		// The default is only used when all of the conditional leadsToModels evaluate to false. In other
		// words: the condition leadsToModels have precedence over the default leadsToModel.
		// We store the default leadsTo subject-id and continue evaluating the other leadsToModels.
		if( !leadsToModel.conditionModel ){
			defaultLeadsTo = leadsToModel.subject;
			continue;
		}

		// The leadsToModel has a condition so we evaluate it and if the condition is true,
		// then we return this leadsToModel as the result.
		var conditionIsTrue = this.evaluateCondition( leadsToModel.conditionModel );
		if( conditionIsTrue ){
			return leadsToModel.subject;
		}
	}

	// returns a subject id.
	return defaultLeadsTo;
}



// This method evaluates a conditionModel. The condition model specifies the condition/expression that
// is to be evaluated. By using a conditionModel object as a wrapper around the actual condition/expression 
// we allow future changes in how the condition is represented. Right now the conditionModel just takes
// a string wich might contain templated variable names in the form: {{variableName}}
// The templated variable names should correspond with a variable declared in the playlist. If no such
// variable exists then it is not replaced. After the variable values have replaced the templated variable
// names, the eval method is used to execute the expression and the result (true or false) is returned.
ximpel.Player.prototype.evaluateCondition = function( conditionModel ){
	var condition = conditionModel.condition;
 	var parsedCondition = condition;

	// First we retrieve an array of all the templated variable names. Templated variables look like this {{variableName1}}
	// So for the string: "{{x}}+{{x}}=={{y}}" we get an array: ['x','x','y']
    var regex = /\{\{(\w+)\}\}/g;
	var variableNames = [];
	var variableNamesTemplated = [];
    while( match = regex.exec(condition) ){
		variableNames.push( match[1] );
		variableNamesTemplated.push( '{{' + match[1] + '}}' );
	}

	// Then we get an array containing the values corresponding the given variable names.
	var variableValues = [];
	for( var i=0; i<variableNames.length; i++ ){
		var variableName = variableNames[i];
		variableValues[i] = this.variables[variableName];
	}

	// This variable will indicate when a variable in the condition failed to be replaced because the
	// variable did not exist for instance.
	var failedToTemplateCondition = false;

	// Then we replace each of the templated variables with the variable values.
	// The result is a string where all the variable names have been replaced with
	// the corresponding variable values.
    $.each( variableNamesTemplated, function( index, key ){
    	// If the variable value of the current variable is not null and not undefined then
    	// we insert the value into the string.
    	if( variableValues[index] !== undefined && variableValues[index] !== null ){
        	parsedCondition = parsedCondition.replace( key, variableValues[index] );
        } else{
        	// If the variable template could not be replaced because the template did not
        	// correspond to an existing XIMPEL variable, then we set the failedToTemplateCondition
        	// flag to true which indicates that the condition can not be evaluated properly.
        	failedToTemplateCondition = true;
        }
    });

    // the condition string contained variable templates that did not correspond to
    // existing XIMPEL variables. So this condition cannot be evaluated and we
    // return false to indicate the condition is not met.
    if( failedToTemplateCondition === true ){
    	return false;
    }

    // We have a condition that properly parsed, so we eval() them.
	var result = eval( parsedCondition );

	// If the expression returned a non boolean value then we consider the condition to be false.
	return (result === true || result === false) ? result : false;
}



// Determine which subject id should be played next.
ximpel.Player.prototype.determineNextSubjectToPlay = function(){
	var leadsTo = this.determineLeadsTo( this.currentSubjectModel.leadsToList );

	// returns a subject id.
	return leadsTo;
}



// This method handles the end event of the sequence player.
ximpel.Player.prototype.handleSequencePlayerEnd = function(){
	// The sequence player has nothing more to play. If the current subject has a leadsTo
	// attribute, then we jump to that subject.
	var subjectId = this.determineNextSubjectToPlay();
	if( subjectId ){
		 this.goTo( subjectId );
	}

	// There is nothing more to play.... we may want to present an end screen here.

	// Publish the player end event. Any (third party) code that registered a handler for this event using
	// addEventHandler() will have its handler called.
	this.pubSub.publish( this.EVENT_PLAYER_END );
}



// Returns the first subject model that is to be played.
ximpel.Player.prototype.getFirstSubjectModel = function(){
	// The first subject to be played is specified in the playlist model (determined in the parser).
	return this.playlistModel.subjectModels[ this.playlistModel.firstSubjectToPlay ];
}



// Add an event handler to listen for events that this Player object throws.
ximpel.Player.prototype.addEventHandler = function( eventName, func ){
	switch( eventName ){
		case this.EVENT_PLAYER_END:
			return this.pubSub.subscribe( this.EVENT_PLAYER_END, func ); break;
		case this.EVENT_VARIABLE_UPDATED:
			return this.pubSub.subscribe( this.EVENT_VARIABLE_UPDATED, func ); break;
		case this.EVENT_SUBJECT_PLAYING:
			return this.pubSub.subscribe( this.EVENT_SUBJECT_PLAYING, func ); break;
		case this.EVENT_SWIPE:
			return this.pubSub.subscribe( this.EVENT_SWIPE, func ); break;
		case this.EVENT_IFRAME_OPEN:
			return this.pubSub.subscribe( this.EVENT_IFRAME_OPEN, func ); break;
		case this.EVENT_IFRAME_CLOSE:
			return this.pubSub.subscribe( this.EVENT_IFRAME_CLOSE, func ); break;
		default:
			ximpel.warn("Player.addEventHandler(): cannot add an event handler for event '" + eventName + "'. This event is not used by the player.");
			break;
			return;
	}
}



// Clear all event handlers that have been registered to this player object.
ximpel.Player.prototype.clearEventHandlers = function( callback ){
	this.pubSub.reset();
	return this;
}



// Cancels a registered event handler for the given eventName and handler function.
ximpel.Player.prototype.clearEventHandler = function( eventName, callback ){
	this.pubSub.unsubscribe( eventName, callback );
}



// The constructMediaItems function takes the list of mediaModels from the playlist object and creates an instance of a media type for each
// mediaModel. These instances are added to the mediaItems property of the player. To access an instance of a media type
// you can do: var mediaItemInstance = this.mediaItems[mediaId]; The mediaId is stored within a mediaModel (determined by the parser).
ximpel.Player.prototype.constructMediaItems = function(){
	var mediaModels = this.getMediaModels();
	
	// For each media model create a media item and store as this.mediaItems[ mediaModel.mediaId ]
	mediaModels.forEach( function( mediaModel ){
		var mediaTypeRegistration = this.availableMediaTypes[ mediaModel.mediaType ];
		var mediaItem = new mediaTypeRegistration['mediaTypeConstructor']( mediaModel.customElements, mediaModel.customAttributes, this.$playerElement, this );
		this.mediaItems[ mediaModel.mediaId ] = mediaItem;
	}.bind(this) );
	
	return this;
}



// returns the player element of this Player() object.
ximpel.Player.prototype.getPlayerElement = function(){
	return this.$playerElement;
}



// Returns the array of mediaModels for the current playlist.
ximpel.Player.prototype.getMediaModels = function(){
	return this.playlistModel.mediaList;
}



// Returns a config property that was specified in the config file or in the playlist file within the <config> element.
// For example getConfigProperty( showControls ) returns the value specified in the config file. For instance: <showControls>true</showControls>
// Return value: the value of the config property or null if the property name doesn't exist.
ximpel.Player.prototype.getConfigProperty = function( propertyName ){
	var value = this.configModel[propertyName];
	if( value !== undefined ){
		return value;
	} else{
		return null;
	}
}


// Handles the pan event on the main ximpelPlayer element. If the current subject has a swipe
// property ('swipeLeftTo', 'swipeRightTo', 'swipeUpTo' or 'swipeDownTo') that matches the pan
// direction, we will let the main ximpelPlayer element be dragged in that direction.
ximpel.Player.prototype.onPan = function(event){

	if( ! this.isPlaying() || ! this.currentSubjectModel ){
		ximpel.warn("Player.onPan(): Ignoring event while stopped or paused");
		return this;
	}

	// Scale deltaX and Y to the scale of the $playerElement div.
	var boundingRect = this.$playerElement[0].getBoundingClientRect(),
		scaleX = boundingRect.width / this.$playerElement[0].offsetWidth,
		scaleY = boundingRect.height / this.$playerElement[0].offsetHeight,
		translateX = event.deltaX / scaleX,
		translateY = event.deltaY / scaleY;

	// Check whether there are subjects defined for the horizontal and vertical pan directions.
	var hEvent = (translateX > 0) ? 'swiperight' : 'swipeleft',
		vEvent = (translateY > 0) ? 'swipedown' : 'swipeup';

	if ( ! this.currentSubjectModel.swipeTo[hEvent] && ! this.currentSubjectModel.swipeTo[vEvent] ) {
		// No subject to swipe to in either of the directions, so lets return
		return;
	}

	// We want the pan to be *either* horizontal or vertical, not both at the same time,
	// so if we have subjects defined in both directions, we will choose the major one.
	var panDirection = ( (this.currentSubjectModel.swipeTo[hEvent] && this.currentSubjectModel.swipeTo[vEvent] && Math.abs(translateX) > Math.abs(translateY)) || !this.currentSubjectModel.swipeTo[vEvent] )
		? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL;

	var translate = (panDirection == Hammer.DIRECTION_HORIZONTAL) ? translateX : translateY;
	var opacity = 1.0 - Math.min(1.0, Math.abs(translate) * 0.0015);
	var scale = 1.0 - Math.min(0.4, Math.abs(translate) * 0.0001);

	var swipeType = (panDirection == Hammer.DIRECTION_HORIZONTAL) ? hEvent : vEvent;
	var nextSubject = this.currentSubjectModel.swipeTo[swipeType];

	if (panDirection == Hammer.DIRECTION_HORIZONTAL) {
		this.$playerElement.css('transform', 'translateX(' + translate + 'px) scale(' + scale + ')');
	} else {
		this.$playerElement.css('transform', 'translateY(' + translate + 'px) scale(' + scale + ')');
	}
	this.$playerElement.css('animation', '');
	this.$playerElement.css('opacity', opacity);

	if (event.isFinal) {
		if (Math.abs(event.velocity) < this.getConfigProperty('minimumSwipeVelocity') || Math.abs(translate) < this.getConfigProperty('minimumSwipeTranslation')) {

			// The pan was either too slow or didn't move far enough, so we just snap back
			this.$playerElement.css('animation', 'swipe 0.5s ease-out forwards');

		} else {

			// Let's do a swipe animation
			if (panDirection == Hammer.DIRECTION_HORIZONTAL) {
				var initPos = this.$playerElement.width() * 0.8 * (translateX > 0 ? -1 : 1);
				this.$playerElement.css('transform', 'translateX(' + initPos + 'px) scale(0.5)');
			} else {
				var initPos = this.$playerElement.height() * 0.8 * (translateY > 0 ? -1 : 1);
				this.$playerElement.css('transform', 'translateY(' + initPos + 'px) scale(0.5)');
			}
			this.$playerElement.css('animation', 'swipe 0.5s ease-out forwards');

			// Change subject
			this.goTo( nextSubject.subject );

			// Publish a swipe event in case anyone's interested
			event.type = swipeType;
			event.nextSubject = nextSubject;
			this.pubSub.publish( this.EVENT_SWIPE, event );
		}
	}
}

// Parser()
// The main method of the parser is .parse() which takes an XMLDoc of the playlist and config.
// The parser processes these XML docs by traversing the node tree recursively and calling a processor 
// for each node it encounters. The final result is a PlaylistModel and a ConfigModel.

// ########################################################################################################################################################

// TODO:
// 	- Check if the shape of an overlay is valid (ie. if square then the "sides" attribute must exist, if rectangle then width and height must exist etc.)
//	- Start using the this.validChildren object to enforce only using validChildren
//  - Start making sure that units are specified. (note that width/heights/x and y should have units specified, if not given then we should add 'px'.)
//  - Right now for the media type nodes we store the custom elements in a special format. We should probably just store the raw DOM elements.

// The constructor function to create instances of this Parser() object.
ximpel.Parser = function(){
	// The mediaTypeRegistrations variable is an object that contains the registrations of the media types.
	// This is needed by the parser to know which custom media tags can be used and which child-tags and attributes 
	// are allowed on the custom media tag. It is stored in the form: {'<mediaTypeId>': <MediaTypeRegistrationObject>, ... }
	this.mediaTypeRegistrations = ximpel.availableMediaTypes;

	// Get an array containing the media type ID's (ie. tag names) that are allowed to be used in the playlist.
	this.registeredMediaTags = Object.getOwnPropertyNames( this.mediaTypeRegistrations );
	
	// An object that defines which children are allowed on each of the elements.
	this.validChildren = {
		'ximpel': 	['playlist','config'],
		'playlist': ['subject', 'score'],
		'subject': 	['description', 'media', 'score', 'sequence', 'parallel'],
		'media': 	['parallel', 'sequence'].concat(this.registeredMediaTags), // add the custom media tags to the allowed children of <media>
		'parallel': ['sequence'].concat(this.registeredMediaTags), 	// add the custom media tags to the allowed children of <parallel>
		'sequence': ['parallel'].concat(this.registeredMediaTags), 	// add the custom media tags to the allowed children of <sequence>;
		'overlay': 	['score'],
 		'score': 	[''],
 		'question':	[''],
 		'description': [''],
		'config': [''],
		// We want to define valid children that will apply to each custom media type, we use __MEDIA_TYPE__ for this.
		 '__MEDIA_TYPE__': ['overlay', 'score', 'question'], // ie. these tags are valid children for each custom media type.
	}

	// This counter is used to give each media item a unique ID that is used within ximpel to refer to that media item.
	this.mediaIdCounter = 1;
}


// The parse() method takes two xmlDoc objects as argument for the the playlist and config file. The config XMLDoc is optional.
// Return value: 	Object in the form: {'playlist': <playlistModelObject>, 'config': <configModelObject>}
ximpel.Parser.prototype.parse = function( playlistXml, configXml ){
	// First we parse the playlist file and get a PlaylistModel() and a ConfigModel() (ie. config can also be specified in the playlist)
	var playlistParseResult = this.parseXml( playlistXml );
	var playlistModel = playlistParseResult['playlist'] || null;
	var playlistConfigModel = playlistParseResult['config'];

	// If no PlaylistModel was returned then something went wrong during the parsing of the playlist.
	if( !playlistModel ){
		ximpel.error("Parser.parser(): Failed to parse the playlist file. The playlist file is invalid.");
		return false;
	}

	// If a config xmlDoc is specified then parse it (the config doc is optional).
	if( configXml ){
		// Parse the given config XML. The result is a ConfigModel() object or an empty object if it is invalid.
		var configParseResult = this.parseXml( configXml );
		var configModel = configParseResult['config'] || null;
		if( !configModel ){
			ximpel.error("Parser.parse(): Failed to parse the config file. The config file is invalid.");
			return false;
		}
	} else{
		// No config XML content specified, so just create a new ConfigModel() object containing the default values.
		var configModel = new ximpel.ConfigModel();
	}

	// Configuration settings can be defined both in a seperate config file, as well as in a config node within the playlist file. If the 
	// playlist file contained a <config> node, then use these config settings to overwrite the settings specified in the config XML file.
	if( playlistConfigModel ){
		configModel.extend( playlistConfigModel );
	}

	return {'playlist': playlistModel, 'config': configModel };
}



// This method parses the given XML document. Depending on the content of the xmlDoc it will return a playlist
// object or a Config object. Or false if the xmlDoc is not a valid ximpel document.
ximpel.Parser.prototype.parseXml = function( xmlDoc ){
	// Get the root element (ie. the <ximpel> element).
	var ximpelNode = xmlDoc.childNodes[0];

	// Check if the XML document was empty.
	if( !ximpelNode ){
		ximpel.error("Parser.parseXml(): Cannot parse the XML contents, the given XML document is empty");
		return null; 
	}
	
	// Check if the root element is <ximpel> (it must be)
	if( ximpelNode.nodeName !== 'ximpel' ){
		ximpel.error("Parser.parseXML(): Invalid document specified. The Root element must be the <ximpel> element.");
		return null;
	}

	// process the ximpel node. 
	var result = this.processXimpelNode( ximpelNode );
	return result;
}



// Process the <ximpel> node. The result looks like:
// {'playlist': <PlaylistModel>, 'config': <ConfigModel>}
// where both the playlist and config may exist, of just one of those.
ximpel.Parser.prototype.processXimpelNode = function( domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var result = {};

	// The ximpel node can have a playlist child-node, a config child-node, or both. We process each child node.
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];

		if( child.nodeName === 'playlist' ){
			// Get a PlaylistModel based on this <playlist> node.
			result['playlist'] = this.processPlaylistNode( child );
		} else if( child.nodeName === 'config' ){
			// Get a ConfigModel based on this <config> node.
			result['config'] = this.processConfigNode( child );
		} else{
			ximpel.warn('Parser.processXimpelNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+child.nodeName+'>. Allowed children: ' + this.validChildren[info.tagName].toString() + '.');
		}
	}
	return result;
}



// Process the <playlist> node.
ximpel.Parser.prototype.processPlaylistNode = function( domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	
	// This will contain the subjectId of the subject that should start to play first.
	var firstSubjectToPlay = null;
	
	var playlistModel = new ximpel.PlaylistModel();

	// Process each of the <playlist>'s child elements
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];

		if( child.nodeName === 'subject' ){
			var subjectModel = this.processSubjectNode( playlistModel, child );

			// Store the subjectModels based on their subjectId so that they can be retrieved using subjectModels[subjectId]
			playlistModel.subjectModels[subjectModel.subjectId] = subjectModel;

			// By default, the subject that appears first in the playlist file is the one that will be played first.
			if( firstSubjectToPlay === null ){
				// firstSubjectToPlay has not been set yet, so this is the first subject and we store its ID.
				firstSubjectToPlay = subjectModel.subjectId;
			}
		} else if( child.nodeName === 'score' || child.nodeName === 'variable' ){
			var variableModifierModel = this.processVariableNode( playlistModel, child );
			playlistModel.variableModifiers.push( variableModifierModel );
		} else{
			ximpel.warn('Parser.processPlaylistNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+child.nodeName+'>. Allowed children: ' + this.validChildren[info.tagName].toString() + '.');
		}
	}

	playlistModel.firstSubjectToPlay = firstSubjectToPlay;
	return playlistModel;
}



// Process a <subject> node.
ximpel.Parser.prototype.processSubjectNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var subjectModel = new ximpel.SubjectModel();

	// Process and store the attributes of the <subject> element.
	for( var i=0; i<info.nrOfAttributes; i++ ){
		var attributeName = info.attributes[i].name;
		var attributeValue = info.attributes[i].value;
		if( attributeName === 'id' ){
			subjectModel.subjectId = attributeValue;
		} else if( attributeName === 'leadsTo' ){
			var leadsToModel = new ximpel.LeadsToModel();
			leadsToModel.subject = attributeValue;
			subjectModel.leadsToList.push( leadsToModel );
		} else if( attributeName === 'swipeLeftTo' ){
			var leadsToModel = new ximpel.LeadsToModel();
			leadsToModel.subject = attributeValue;
			subjectModel.swipeTo.swipeleft = leadsToModel;
		} else if( attributeName === 'swipeRightTo' ){
			var leadsToModel = new ximpel.LeadsToModel();
			leadsToModel.subject = attributeValue;
			subjectModel.swipeTo.swiperight = leadsToModel;
		} else if( attributeName === 'swipeUpTo' ){
			var leadsToModel = new ximpel.LeadsToModel();
			leadsToModel.subject = attributeValue;
			subjectModel.swipeTo.swipeup = leadsToModel;
		} else if( attributeName === 'swipeDownTo' ){
			var leadsToModel = new ximpel.LeadsToModel();
			leadsToModel.subject = attributeValue;
			subjectModel.swipeTo.swipedown = leadsToModel;
		}  else{
			ximpel.warn('Parser.processSubjectNode(): Invalid attribute ignored! Attribute \''+attributeName+'\' on element <'+info.tagName+'> is not supported. Make sure you spelled the attribute name correctly.');
		}
	}

	// Process and store the child elements of the <subject> element.
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];
		var childName = child.nodeName;

		if( childName === 'description' ){
			subjectModel.description = this.processDescriptionNode( playlistModel, child );
		} else if( childName === 'media' ){
			subjectModel.sequenceModel = this.processMediaNode( playlistModel, child );
		} else if( childName === 'score' || childName === 'variable' ){
			var variableModifier = this.processVariableNode( playlistModel, child );
			subjectModel.variableModifiers.push( variableModifier );
		} else if( childName === 'leadsTo' ){
			var leadsToModel = this.processLeadsToNode( playlistModel, child );
			subjectModel.leadsToList.push( leadsToModel );
		} else {
			ximpel.warn('Parser.processSubjectNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+childName+'>. Allowed children: ' + this.validChildren[info.tagName].toString() + '.');
		}
	}

	return subjectModel;
}



// Process the <media> node.
ximpel.Parser.prototype.processMediaNode = function( playlistModel, domElement ){
	// The media node is just there to indicate that within this <media> </media section
	// there will be media items (like <video> and <audio>). However in essence this just
	// indicates a sequence of media items. Therefore we process it as if it were a <sequence>
	// node. So the result will be a SequenceModel object
	return this.processSequenceNode( playlistModel, domElement );
}



// Process a <sequence> node, the result is a SequenceModel
ximpel.Parser.prototype.processSequenceNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var sequenceModel = new ximpel.SequenceModel();

	// Process and store the attributes of the <sequence> element.
	for( var i=0; i<info.nrOfAttributes; i++ ){
		var attributeName = info.attributes[i].name;
		var attributeValue = info.attributes[i].value;
		if( attributeName === 'order' ){
			sequenceModel.order = attributeValue;
		} else{
			ximpel.warn('Parser.processSequenceNode(): Invalid attribute ignored! Attribute \''+attributeName+'\' on element <'+info.tagName+'> is not supported. Make sure you spelled the attribute name correctly.');
		}
	}

	// Process and store the child elements of the parent element.
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];
		var childName = child.nodeName;

		if( $.inArray( childName, this.registeredMediaTags ) > -1 ){
			// The child-node is a registered media item... (<video>, or <audio>, etc.)
			sequenceModel.add( this.processMediaTypeNode( playlistModel, child ) );
		} else if( childName === 'parallel' ){
			sequenceModel.add( this.processParallelNode( playlistModel, child ) );
		} else if( childName === 'sequence' ){
			sequenceModel.add( this.processSequenceNode( playlistModel, child ) );
		} else{
			ximpel.warn('Parser.processSequenceNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+childName+'>. Allowed children: ' + this.validChildren[info.tagName].toString()  + '.');
		}
	}
	return sequenceModel;
}



// Process the <parallel> node. The result is a ParallelModel object.
ximpel.Parser.prototype.processParallelNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var parallelModel = new ximpel.ParallelModel();

	// Process and store the child elements of the <parallel> element.
	for( var i=0; i<info.childElements; i++ ){
		var child = info.childElements[i];
		var childName = child.nodeName;
		
		if( $.inArray( childName, this.registeredMediaTags ) > -1 ){
			// The child-node is a registered media item...
			parallelModel.add( this.processMediaTypeNode( playlistModel, child ) );
		} else if( childName === 'sequence' ){
			parallelModel.add( this.processSequenceNode( playlistModel, child ) );
		} else{
			ximpel.warn('Parser.processParallelNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+childName+'>. Allowed children: ' + this.validChildren[info.tagName].toString()  + '.');
		}
	}
	return parallelModel;
}



// Process a media type node like <video> or <picture>. The result is a MediaModel object.
ximpel.Parser.prototype.processMediaTypeNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var mediaModel = new ximpel.MediaModel();

	// The mediaType is stored in the media model, this indicates the tagName / name of the media type.
	mediaModel.mediaType = info.tagName;

	// Store the information on the attributes of the media item tag in the MediaModel.
	// For instance in the case of: <video width=".." leadsto="..." /> we store: "width" and "leadsTo" attribute information.
	for( var i=0; i<info.nrOfAttributes; i++ ){
		var attributeName = info.attributes[i].name;
		var attributeValue = info.attributes[i].value;

		if( attributeName === 'leadsTo' ){
			var leadsToModel = new ximpel.LeadsToModel();
			leadsToModel.subject = attributeValue;
			mediaModel.leadsToList.push( leadsToModel );
		} else if( attributeName === 'duration' ){
			// Store the duration is miliseconds.
			mediaModel.duration = parseFloat(attributeValue)*1000;
		} else if( attributeName === 'repeat' ){
			mediaModel.repeat = attributeValue === "true" ? true : false;
		} else{
			// The media model has a 'customAttributes' property which stores all the attributes that are not known to ximpel.
			// We do this because these attributes may be used by the media type which ximpel knows nothing about.
			// The media type implementation can access them by doing: customAttributes['nameOfAttribute']
			mediaModel.customAttributes[attributeName] = attributeValue;
		}
	}

	// Process and store the child elements of the custom media type element.
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];
		var childName = child.nodeName;

		if( childName === 'overlay' ){
			mediaModel.overlays.push( this.processOverlayNode( playlistModel, child, i ) );
		} else if( childName === 'score' || childName === 'variable' ){
			var variableModifier = this.processVariableNode( playlistModel, child );
			mediaModel.variableModifiers.push( variableModifier );
		} else if( childName === 'question' ){
			mediaModel.questionLists.push( this.processQuestionNode( playlistModel, child ) );
		} else if( childName === 'questions' ){
			mediaModel.questionLists.push( this.processQuestionsNode( playlistModel, child ) );
		} else if( childName === 'leadsTo' ){
			var leadsToModel = this.processLeadsToNode( playlistModel, child );
			mediaModel.leadsToList.push( leadsToModel );
		} else{
			// If the name of the child element is unknown then we assume its a custom element for the media type.
			// We pass this customElements information to the Media Type implementation.
			var childAttributes = {};
			for( var j=0; j<child.attributes.length; j++ ){
				childAttributes[child.attributes[j].name] = child.attributes[j].value;
			}
			var customElementModel = new ximpel.CustomElementModel( childName, childAttributes );
			mediaModel.customElements.push( customElementModel );
		}
	}
	
	// We set the mediaId to a unique ID value which we use to distinguish the media items.
	mediaModel.mediaId = this.mediaIdCounter++;

	// we add the media items to mediaList of the playlistModel.
	playlistModel.mediaList.push( mediaModel ); 

	return mediaModel;
}



// Process the <questions> node. The result is a QuestionListModel object.
ximpel.Parser.prototype.processQuestionsNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var questionListModel = new ximpel.QuestionListModel();

	// Process and store the attributes of the <questions> element.
	for( var i=0; i<info.nrOfAttributes; i++ ){
		var attributeName = info.attributes[i].name;
		var attributeValue = info.attributes[i].value;
		if( attributeName === 'startTime' ){
			questionListModel.startTime = parseFloat(attributeValue)*1000;
		} else if( attributeName === 'questionTimeLimit' ){
			questionListModel.questionTimeLimit = parseFloat(attributeValue)*1000;
		} else if( attributeName === 'nrOfQuestionsToAsk' ){
			questionListModel.nrOfQuestionsToAsk = parseInt(attributeValue);
		} else if( attributeName === 'questionOrder' ){
			questionListModel.questionOrder = attributeValue;
		} else{
			ximpel.warn('Parser.processQuestionsNode(): Invalid attribute ignored! Attribute \''+attributeName+'\' on element <'+info.tagName+'> is not supported. Make sure you spelled the attribute name correctly.');
		}
	}

	// Process and store the child elements of the <questions> element.
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];
		var childName = child.nodeName;
		
		if( childName === 'question' ){
			questionListModel.questions.push( this.processQuestionNode( playlistModel, child ) );
		} else{
			ximpel.warn('Parser.processQuestionsNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+childName+'>. Allowed children: ' + this.validChildren[info.tagName].toString()  + '.');
		}
	}
	return questionListModel;
}



// Process the <question> node. The result is a QuestionModel()
ximpel.Parser.prototype.processQuestionNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var questionModel = new ximpel.QuestionModel();
	var hasExplicitQuestionList = domElement.parentNode.nodeName === 'questions' ? true : false;

	// Process and store the attributes of the <question> element.
	for( var i=0; i<info.nrOfAttributes; i++ ){
		var attributeName = info.attributes[i].name;
		var attributeValue = info.attributes[i].value;

		if( attributeName === 'startTime' && hasExplicitQuestionList === false ){
			questionModel.startTime = parseFloat(attributeValue)*1000;
		} else if( attributeName === 'questionTimeLimit' ){
			questionModel.questionTimeLimit = parseFloat(attributeValue)*1000;
		} else if( attributeName === 'answer' ){
			questionModel.answer = attributeValue;
		} else{
			ximpel.warn('Parser.processQuestionNode(): Invalid attribute ignored! Attribute \''+attributeName+'\' on element <'+info.tagName+'> is not supported. Make sure you spelled the attribute name correctly.');
		}
	}

	// Find the textnode within the <question> tag (ie. the actual question being asked.) Example:
	// <question>How old is a cow?<option>1 year</option><option>5 years</option></question>
	// So in this example we will get the text: "How old is a cow?"
	var questionText = "";
	// We loop over all child nodes of the <question> element
	for( var i=0; i<domElement.childNodes.length; i++ ){
		var node = domElement.childNodes[i];
		if( node.nodeType === 3 ){
			// If the child node is a textnode (ie. nodeType === 3), then we add the text to our result
			// Note that we must finish the loop, because sometimes the text is put into seperate text nodes.
			// so we must add each of the textnodes.
			questionText += domElement.childNodes[i].nodeValue;
		}
	}
	// Strip off the whitespace/newline characters around the textnode.
	questionModel.questionText = $.trim( questionText );

	// Process and store the child elements of the <question> element.
	var nrOfOptions=0;
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];
		var childName = child.nodeName;
		
		if( childName === 'option' ){
			nrOfOptions+=1;
			var optionModel = this.processOptionNode( playlistModel, child );
			// If the option was not given a name attribute, then we set the optionName equal to the
			// index of the option plus 1. So the first options is named 1, the second option named 2 etc.
			optionModel.optionName = optionModel.optionName === "" ? ""+nrOfOptions : optionModel.optionName;
			questionModel.options.push( optionModel );
		} else if( childName === 'score' || childName === 'variable' ){
			var variableModifier = this.processVariableNode( playlistModel, child );
			questionModel.variableModifiers.push( variableModifier );
		} else{
			ximpel.warn('Parser.processQuestionNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+childName+'>. Allowed children: ' + this.validChildren[info.tagName].toString()  + '.');
		}
	}

	// If no options were given then we consider it to be a true false question so we create true/false options.
	if( questionModel.options.length <= 0 ){
		var trueOption = new ximpel.QuestionOptionModel();
		trueOption.optionName = "true";
		trueOption.optionText = "True";
		var falseOption = new ximpel.QuestionOptionModel();
		falseOption.optionName = "false";
		falseOption.optionText = "False";
		questionModel.options.push( trueOption );
		questionModel.options.push( falseOption );
	}

	// The <questions> tag is used to group a set of questions together. Every <question> belongs to a list of questions. 
	// All questions that are within the same <questions> tag, are considered to be part of the same question list. 
	// However, if you don't explicitly wrap a question in a <questions> tag, then the <question> is considered to be 
	// its own list of just one question. So if the question is not explicitly added to a <questions> tag then we let
	// this function create a QuestionListModel just for this one question.
	if( !hasExplicitQuestionList ){
		var questionList = new ximpel.QuestionListModel();
		questionList.startTime = questionModel.startTime || 0;
		questionList.questions.push( questionModel );
		return questionList;
	} 

	return questionModel;
}



// Process an <option> node. The result is an OptionModel object.
ximpel.Parser.prototype.processOptionNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var optionModel = new ximpel.QuestionOptionModel();

	// Process and store the attributes of the <option> element.
	for( var i=0; i<info.nrOfAttributes; i++ ){
		var attributeName = info.attributes[i].name;
		var attributeValue = info.attributes[i].value;

		if( attributeName === 'name' ){
			optionModel.optionName = attributeValue;
		} 
		ximpel.warn('Parser.processOptionNode(): Invalid attribute ignored! Attribute \''+attributeName+'\' on element <'+info.tagName+'> is not supported. Make sure you spelled the attribute name correctly.');
	}

	// Find the textnode within the <option> tag (ie. the actual option text to be shown.)
	var optionText = "";
	for( var i=0; i<domElement.childNodes.length; i++ ){
		if( domElement.childNodes[i].nodeType === 3 ){
			// If the child node is a textnode (ie. nodeType === 3), then we add the text to our result
			// Note that we must finish the loop, because sometimes the text is put into seperate text nodes.
			// so we must add each of the textnodes.
			optionText += domElement.childNodes[i].nodeValue;
		}
	}
	// Strip off the whitespace/newline characters around the text.
	optionModel.optionText = $.trim( optionText );
	
	return optionModel;
}



// Process the <variable> node. The result is a VariableModifierModel object.
ximpel.Parser.prototype.processVariableNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var variableModifierModel = new ximpel.VariableModifierModel();

	// Process and store the attributes of the element.
	for( var i=0; i<info.nrOfAttributes; i++ ){
		var attributeName = info.attributes[i].name;
		var attributeValue = info.attributes[i].value;
		if( attributeName === 'id' ){
			variableModifierModel.id = attributeValue;
		} else if( attributeName === 'operation' ){
			variableModifierModel.operation = attributeValue;
		} else if( attributeName === 'value' ){
			variableModifierModel.value = attributeValue;
		} else{
			ximpel.warn('Parser.processVariableNode(): Invalid attribute ignored! Attribute \''+attributeName+'\' on element <'+info.tagName+'> is not supported. Make sure you spelled the attribute name correctly.');
		}
	}

	// Process and store the child elements of the element.
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];
		var childName = child.nodeName;
		
		// No child nodes supported for the score element.
		ximpel.warn('Parser.processVariableNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+childName+'>. No children allowed on <'+info.tagName+'>.');
	}

	return variableModifierModel;
}



// Process the >leadsTo> node. The result is a LeadsToModel object.
ximpel.Parser.prototype.processLeadsToNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var leadsToModel = new ximpel.LeadsToModel();


	// Process and store the attributes of the leadsTo element.
	for( var i=0; i<info.nrOfAttributes; i++ ){
		var attributeName = info.attributes[i].name;
		var attributeValue = info.attributes[i].value;
		if( attributeName === 'condition' ){
			var condition = attributeValue;
		} else if( attributeName === 'subject' ){
			leadsToModel.subject = attributeValue
		} else{
			ximpel.warn('Parser.processLeadsToNode(): Invalid attribute ignored! Attribute \''+attributeName+'\' on element <'+info.tagName+'> is not supported. Make sure you spelled the attribute name correctly.');
		}
	}

	// If a condition attribute was specified on the <leadsTo> node.
	// Then we create a ConditionModel object and store it in our LeadsToModel.
	if( condition  ){
		var conditionModel = new ximpel.ConditionModel();
		conditionModel.condition = condition ? condition : null;
		leadsToModel.conditionModel = conditionModel;
	} else{
		leadsToModel.conditionModel = null;

	}
	return leadsToModel;
}



// Process the <description> node. The result is a string containing the description.
ximpel.Parser.prototype.processDescriptionNode = function( playlistModel, domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var childNode = domElement.childNodes[0];
	var description = "";

	
	if( !childNode ){
		// Nothing was specified between <description> and </description> so the description is empty.
		description = "";
	} else if( childNode.nodeType === 3 ){ 
		// text was specified between <description> and </description> (ie. node type === 3)
		description = $.trim( childNode.nodeValue );
	} else{
		// A non textnode was specified between <description> and </description>, probably an XML tag, which is not allowed.
		ximpel.warn('Parser.processDescriptionNode(): Invalid description! Element <'+info.tagName+'> has an invalid child node. Only text is allowed inside the <description> element.');
	}

	return description;
}



// Process the <overlay> node. The result is an OverlayModel object.
ximpel.Parser.prototype.processOverlayNode = function( playlistModel, domElement, index ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var overlayModel = new ximpel.OverlayModel();

	// Store index for stable sorting
	overlayModel.index = index;

	// Process and store the attributes of the <overlay> element.
	for( var i=0; i<info.nrOfAttributes; i++ ){
		var attributeName = info.attributes[i].name;
		var attributeValue = info.attributes[i].value;
		if( attributeName === 'x' ){
			overlayModel.x = parseInt(attributeValue);
		} else if( attributeName === 'y' ){
			overlayModel.y = parseInt( attributeValue);
		} else if( attributeName === 'shape' ){
			overlayModel.shape = attributeValue;
		} else if( attributeName === 'width' ){
			overlayModel.width = parseInt(attributeValue);
		} else if( attributeName === 'height' ){
			overlayModel.height = parseInt(attributeValue);
		} else if( attributeName === 'side' ){
			overlayModel.side = parseInt(attributeValue);
		} else if( attributeName === 'diameter' ){
			overlayModel.diameter = parseInt(attributeValue);
		} else if( attributeName === 'leadsTo' ){
			var leadsToModel = new ximpel.LeadsToModel();
			leadsToModel.subject = attributeValue;
			overlayModel.leadsToList.push( leadsToModel );
		} else if( attributeName === 'startTime' ){
			overlayModel.startTime = parseFloat(attributeValue)*1000;
		} else if( attributeName === 'duration' ){
			overlayModel.duration = parseFloat(attributeValue)*1000;
		} else if( attributeName === 'text' ){
			overlayModel.text = attributeValue;
		} else if( attributeName === 'alpha' ){
			overlayModel.opacity = attributeValue;
		} else if( attributeName === 'hoverAlpha' ){
			overlayModel.hoverOpacity = attributeValue;
		} else if( attributeName === 'backgroundColor' ){
			overlayModel.backgroundColor = attributeValue;
		} else if( attributeName === 'hoverBackgroundColor' ){
			overlayModel.hoverBackgroundColor = attributeValue;
		} else if( attributeName === 'textColor' ){
			overlayModel.textColor = attributeValue;
		} else if( attributeName === 'hoverTextColor' ){
			overlayModel.hoverTextColor = attributeValue;
		} else if( attributeName === 'fontFamily' ){
			overlayModel.fontFamily = attributeValue;
		} else if( attributeName === 'hoverFontFamily' ){
			overlayModel.hoverFontFamily = attributeValue;
		} else if( attributeName === 'fontSize' ){
			overlayModel.fontSize = attributeValue;
		} else if( attributeName === 'hoverFontSize' ){
			overlayModel.hoverFontSize = attributeValue;
		} else if( attributeName === 'image' ){
			overlayModel.backgroundImage = attributeValue;
		} else if( attributeName === 'hoverImage' ){
			overlayModel.hoverBackgroundImage = attributeValue;
		} else if( attributeName === 'waitForMediaComplete' ){
			overlayModel.waitForMediaComplete = attributeValue;
		} else if( attributeName === 'description' ){
			overlayModel.description = attributeValue;
		} else{
			ximpel.warn('Parser.processOverlayNode(): Invalid attribute ignored! Attribute \''+attributeName+'\' on element <'+info.tagName+'> is not supported. Make sure you spelled the attribute name correctly.');
		}
	}

	// Process and store the child elements of the <overlay> element.
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];
		var childName = child.nodeName;

		if( childName === 'score' || childName === 'variable' ){
			var variableModifier = this.processVariableNode( playlistModel, child );
			overlayModel.variableModifiers.push( variableModifier );
		} else if( childName === 'leadsTo' ){
			var leadsToModel = this.processLeadsToNode( playlistModel, child );
			overlayModel.leadsToList.push( leadsToModel );
		} else{
			ximpel.warn('Parser.processOverlayNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+childName+'>. Allowed children: ' + this.validChildren[info.tagName].toString()  + '.');
		}
	}
	return overlayModel;
}



// Process the <config> node. The result is a ConfigModel object.
ximpel.Parser.prototype.processConfigNode = function( domElement ){
	// Get some info about the current domElement (like its parent, its children, etc)
	var info = this.getDomElementInfo( domElement );
	var configModel = new ximpel.ConfigModel();
	
	// Process and store the child elements of the <config> element.
	for( var i=0; i<info.nrOfChildElements; i++ ){
		var child = info.childElements[i];
		var childName = child.nodeName;

		if( childName === 'enableControls' ){
			configModel.enableControls = ( $.trim(child.textContent).toLowerCase() === 'false') ? false : true;
		} else if( childName === 'controlsDisplayMethod' ){
			configModel.controlsDisplayMethod = $.trim(child.textContent);
		} else if( childName === 'mediaDirectory' ){
			configModel.mediaDirectory = $.trim(child.textContent);
		} else if( childName === 'showScore' ){
			configModel.showScore = ( $.trim(child.textContent).toLowerCase() === 'true');
		} else if( childName === 'minimumSwipeVelocity' ){
			configModel.minimumSwipeVelocity = parseFloat(child.textContent);
		} else if( childName === 'minimumSwipeTranslation' ){
			configModel.minimumSwipeTranslation = parseFloat(child.textContent)
		}
		else{
			ximpel.warn('Parser.processConfigNode(): Invalid child ignored! Element <'+info.tagName+'> has child <'+childName+'>.This child element is not allowed on <'+info.tagName+'>.');
		}
	}

	return configModel;
}



// element.children gives the child nodes that are of type 'element'. However, the element.children attribute
// does not work in IE on XML elements. This function is used to get the child elements also for IE browsers.
// Note that for internet explorer we return an array while for other browsers we return domElement.children 
// which doesn't actually return an array but something that looks and functions alot like an array.
ximpel.Parser.prototype.getChildElementNodes = function( domElement ){
	if( domElement.children ){
		// for all browsers
		return domElement.children;
	} else{
		// For internet explorer
		var nrOfChildNodes = domElement.childNodes.length;
		var children = [];
		for( var i=0; i < nrOfChildNodes; i++ ){
    		var child = domElement.childNodes[i];
    		if( child.nodeType === 1 ){
    			children.push( child );
    		}
		}
		return children;
	}
}


// Returns an object containing some information about the given domElement
// This information includes the tagName, the attributes, the number of attributes, the childElements, etc.
ximpel.Parser.prototype.getDomElementInfo = function( domElement ){
	var domElementInfo = {};

	// Get the name (tag) of the DOM element (ie. for <ximpel> it returns gets "ximpel")
	domElementInfo.tagName = domElement.nodeName;

	// Get the attributes of the DOM element.
	domElementInfo.attributes = domElement.attributes;

	// Get the nr of attributes on the DOM element.
	domElementInfo.nrOfAttributes = domElementInfo.attributes.length;

	// Get the child DOM nodes of type 'element' (returns an array like object)
	domElementInfo.childElements = this.getChildElementNodes( domElement );

	// Get the number of child DOM nodes of type 'element'
	domElementInfo.nrOfChildElements = domElementInfo.childElements.length;

	return domElementInfo;
}
// MediaPlayer()
// The media player is the component that plays a MediaModel. When you define a media item in the playlist, for instance
// a <video> or an <audio> media item, then the parser will convert this to a MediaModel which contains all the information
// about that media item such as: the duration, the overlays to be shown, the custom attributes and elements that were added
// between the media tags (between <video> and </video>), the variable modifers, etc.
// The MediaPlayer is responsible for:
// - starting the media item (ie. doing mediaItem.play() )
// - Showing/hiding overlays at the appropriate times.
// - Showing/hiding questions at the apropriate times.
//
// ########################################################################################################################################################

// TODO:
// - in update media player we check if the mediaHasEnded and if so, we do not update the overlays anymore.
//   we should probably update them anyway, but not use the play time but the total play time. The same 
//   counts for questions.

ximpel.MediaPlayer = function( player, mediaModel ){
	// The MediaPlayer uses and is used by the Player() object and as such it has a reference to it and all of the Player()'s data.
	this.player = player;

	// The $playerElement is the main element used to add all the DOM elements to that are part of ximpel (overlays, media items, questions, etc)
	this.$playerElement = player.getPlayerElement();

	// Will store the mediaModel which contains the information to determine when to show what (ie. overlays/media items/questions. etc.)
	this.mediaModel = null;

	// Will store the mediaItem which is the actual media type object that is to be played (ie. a Video object or Audio object for example).
	this.mediaItem = null;

	// This will hold a pointer to the function that can determine how long a media item has been playing. This will be
	// the default method implemented in this MediaPlayer unless the media item provides its own getPlayTime method.
	this.getPlayTime = null;

	// This will store the overlay models ordered by their startTime. 
	this.overlaysSortedByStartTime = null;

	// An index pointing to the first overlay in the 'overlaysSortedByStartTime' array which still has to be started / played.
	// This is increased by one whenever an overlay is displayed, so that it points to the next overlay that is to be displayed.
	this.overlayIndexToStartNext = 0;

	// The overlays that are currently being played/displayed are stored in the playingOverlays array
	this.playingOverlays = [];

	// The timeout handler for controlling media player updates. We store this to be able to turn the timeout off again.
	this.mediaPlayerUpdateHandler = null;

	// A boolean variable to indicate whether the media player has finished playing the media model.
	this.mediaHasEnded = false;

	// PubSub is used to subscribe callback functions for specific events and to publish those events to the subscribers.
	this.pubSub = new ximpel.PubSub();

	// The state of the media player (ie. playing, paused, stopped)
	this.state = this.STATE_STOPPED;

	// is used when unpausing the media player. It indicates whether play() should be called on the media item. 
	// This should only be done if the media item was in a playing state before the media player was paused.
	this.playMediaItemWhenMediaPlayerResumes = false;

	// If the media type that is being played does not provide a getPlayTime() function then we need to track how long
	// a media item has been playing by ourselves. The reason we check if the mediaItem provides a getPlayTime() function
	// is because a media item may be able to more accurately keep track of its playtime. For example a youtube video
	// may have loading issues (even if it has been partly preloaded). In that case the youtube media item may provide more
	// accurate information on how long it really has been playing (by reading the video's current playback time)
	// The MediaPlyer uses the playTimestamp and pauseTimestamps to keep track of how much play/pause time is passing.
	this.playTimestamp = 0;
	this.pauseTimestamp = 0;

	// The total play time indicates the time that the media item has been playing in total. The getPlayTime() method returns
	// The time the playback time of the media item, but this is not the same as the total playtime when the media item is being repeated.
	this.totalPlayTime = 0;

	// The on end subscription function is registered as onEnd callback, we store it so that we can unregister this callback function when
	// the media player stops playing this media item. We do this because we re-use media item objects.
	this.mediaItemOnEndSubscriptionFunction = null;

	// This will hold the questionManager instance that takes care of managing questions.
	this.questionManager = null;

	// If a mediaModel has been specified, then by calling use() we initialize the mediaPlayer to make it use the media model.
	// If no mediaModel has been specified then use() must be called manually before the mediaPlayer can start playing.
	if( mediaModel ){
		this.use( mediaModel, true );
	}
};
ximpel.MediaPlayer.prototype.MEDIA_PLAYER_UPDATE_INTERVAL = 50; 
ximpel.MediaPlayer.prototype.EVENT_MEDIA_PLAYER_END = 'ended';
ximpel.MediaPlayer.prototype.EVENT_IFRAME_OPEN = 'iframe_open';
ximpel.MediaPlayer.prototype.EVENT_IFRAME_CLOSE = 'iframe_close';
ximpel.MediaPlayer.prototype.STATE_PLAYING = 'state_mp_playing';
ximpel.MediaPlayer.prototype.STATE_PAUSED = 'state_mp_paused';
ximpel.MediaPlayer.prototype.STATE_STOPPED = 'state_mp_stopped';



// The use() method can be called to start using the given mediaModel. This resets the entire MediaPlayer and will then
// use the new media model for playback.
ximpel.MediaPlayer.prototype.use = function( mediaModel, preventReset ){
	// Reset this mediaPlayer if the preventReset argument is set to false. The preventReset is used when you know
	// the MediaPlayer is already in its default state.
	if( !preventReset ){
		this.reset();
	}

	this.mediaModel = mediaModel;

	// Get the media item corresponding to this media model from the player. (note that in principal
	// we could also construct the media item right here, however we decided to construct them in advance so they
	// can be re-used)
	this.mediaItem = this.player.mediaItems[mediaModel.mediaId];

	// Register an event handler for when the mediaItem ends. Note that not all media types will end. For instance, an image will play 
	// indefinitely unless manually interrupted by this MediaPlayer when it exceeds its duration as specified in the playlist.
	this.mediaItemOnEndSubscriptionFunction = this.mediaItem.addEventHandler( 'ended', this.handlePlaybackEnd.bind(this) );

	// If the mediaItem provides a getPlayTime method, then we use that one. If it doesn't then we use the default media player method.
	if( this.mediaItem.getPlayTime ){
		this.getPlayTime = this.mediaItem.getPlayTime.bind(this.mediaItem);
	} else{ 
		this.getPlayTime = this.getPlayTimeDefault;
	}

	// Create a QuestionManager and take the list of question-lists from the new mediaModel.
	// We tell the question manager to use that question list.
	this.questionManager = new ximpel.QuestionManager( this.player, this.$playerElement, this.getPlayTime, mediaModel.questionLists );

	// Take the list of overlays from the new mediaModel and store them sorted by starttime.
	this.overlaysSortedByStartTime = this.getOverlaysSortedByStartTime( mediaModel.overlays );
}



// The reset function resets the media player into the start state from where it can start playing a media model again.
// After this method the media player has no visual elements displayed anymore.
ximpel.MediaPlayer.prototype.reset = function( clearRegisteredEventHandlers ){
	if( this.mediaItem ){
		this.mediaItem.removeEventHandler( 'ended', this.mediaItemOnEndSubscriptionFunction );
		this.mediaItem.stop();
	}
	if( this.questionManager ){
		this.questionManager.stop();
		this.questionManager = null;
	}

	// Stop updating the media player (ie. checking if overlays/questions need to be started or stopped, etc.
	this.turnOffMediaPlayerUpdates();
	this.destroyPlayingOverlays();
	this.playingOverlays = [];
	this.overlayIndexToStartNext = 0;
	this.resetPlayTime();
	this.resetTotalPlayTime();
	this.mediaHasEnded = false;
	this.state = this.STATE_STOPPED;
	this.playMediaItemWhenMediaPlayerResumes = false;
	this.mediaItemOnEndSubscriptionFunction = null;

	if( clearRegisteredEventHandlers ){
		// resets the pubsub of the media player so that all registered callbacks are unregistered.
		this.clearEventHandlers();
	}
}



// Start playing the media model.
ximpel.MediaPlayer.prototype.play = function( mediaModel ){
	// If a mediaModel argument is specified then that media model will be used from now on.
	if( mediaModel ){ 
		this.use( mediaModel );
	} 

	// If no media model has been set for the media player then there is nothing to play.
	if( !this.mediaModel ){
		ximpel.error("MediaPlayer.play(): cannot start playing because no media model has been specified.");
		return;
	}

	// Ignore this play() call if the media player is already in a playing state.
	if( this.isPlaying() ){
		ximpel.warn("MediaPlayer.play(): play() called while already playing.");
		return this;
	} else if( this.isPaused() ){
		this.resume();
		return;
	}

	// Indicate that the media player is in a playing state.
	this.state = this.STATE_PLAYING;

	// Start playing the mediaItem
	this.mediaItem.play();

	// This does some stuff needed to keep track of the playTime of a media item.
	this.updatePlayTimeTracking( this.STATE_PLAYING );

	// The media player needs to check if updates are necessary regurally such as checking if overlays need to be displayed at specific
	// points in time during the media playback or if a media item has surpassed its duration.
	this.turnOnMediaPlayerUpdates();
	return this;
}



// Pause playing the media model.
ximpel.MediaPlayer.prototype.pause = function(){
	// Ignore this pause() call if the media player is already in a paused state.
	if( this.isPaused() ){
		ximpel.warn("MediaPlayer.pause(): pause() called while already paused.");
		return this;
	}

	// Indicate that the media player is in a paused state.
	this.state = this.STATE_PAUSED;

	if( this.mediaItem.isPlaying() ){
		// Store that the media item should be played when the media player resumes. (is not the case if the media item is already paused.)
		this.playMediaItemWhenMediaPlayerResumes = true; 

		// pause the media item.
		this.mediaItem.pause();
	} else{
		// Store that the media item should not be played when the media player resumes (because it was already not playing before it was paused)
		this.playMediaItemWhenMediaPlayerResumes = false;
	}

	// This does some stuff needed to keep track of the playTime of a media item.
	this.updatePlayTimeTracking( this.STATE_PAUSED );

	// Turn off the media player updates. The play time of media-items doesn't change while pausing so no need to check for updates.
	this.turnOffMediaPlayerUpdates();

	return this;
}



// The resume method resumes the media player. This does nothing if the media player is not in a paused state.
// It will resume the media player from the same state that it was in when it was paused.
ximpel.MediaPlayer.prototype.resume = function(){
	// Ignore this resume() call if the media player is not in a paused state.
	if( !this.isPaused() ){
		ximpel.warn("MediaPlayer.resume(): resume() called while not paused.");
		return this;
	}

	// The media item was playing when the media player was paused, so we resume playing the media item now that the media player is playing again.
	if( this.playMediaItemWhenMediaPlayerResumes === true ){
		this.mediaItem.play();
	}

	// Inicate the media player is in a playing state again.
	this.state = this.STATE_PLAYING;

	// This does some stuff needed to keep track of the playTime of a media item.
	this.updatePlayTimeTracking( this.STATE_PLAYING );

	// Media player updates are always on when in a playing state, so we turn them on again.
	this.turnOnMediaPlayerUpdates();

	return this;
}



// Stop playing the media model. After the function has finished, no visual elements are displayed anymore by the media player.
// This method does nothing if the media player is already in a stopped state.
ximpel.MediaPlayer.prototype.stop = function(){
	// Ignore this stop() call if the media player is already in a stopped state.
	if( this.isStopped() ){
		return this;
	}

	// This does some stuff needed to keep track of the playTime of a media item.
	this.updatePlayTimeTracking( this.STATE_STOPPED );

	// Reset the media player back into its original state.
	this.reset();

	return this;
}



// This method updates the media player by checking several things such as whether overlays need to be displayed or hidden
// or checking whether the media item has reached its duration as specified in the playlist. This method will be called 
// every this.MEDIA_PLAYER_UPDATE_INTERVAL miliseconds as long as media player updates are on. These can be turned of with
// the method turnOffMediaPlayerUpdates()
ximpel.MediaPlayer.prototype.updateMediaPlayer = function(){
	var currentPlayTime = this.getPlayTime();

	// We update the overlays (ie. check if overlays need to be started/stopped) only if the media item has not yet ended.
	// If the media has ended but is set to repeat, then the overlays should not be repeated as well: just the media item.
	if( !this.mediaHasEnded ){
		this.updateOverlays( currentPlayTime );
	}

	if( !this.mediaHasEnded ){
		this.questionManager.update( currentPlayTime );
	}
	// Note that checkMediaItemDuration must be done after updateOverlays, because in the case when a media item has surpassed its duration limit
	// a ended event will be triggered. Its only logical to not do updates after that event anymore. Otherwise weird side affects may occur.
	this.checkMediaItemDuration( currentPlayTime );
}



// This function checks whether overlays need to be displayed or hidden based on their start time and duration.
ximpel.MediaPlayer.prototype.updateOverlays = function( currentPlayTime ){
	// Check if there are any overlays which need to be hidden/stopped by iterating over all the currently playing overlays.
	for( var i=0; i<this.playingOverlays.length; i++ ){
		var overlayEndTime = this.playingOverlays[i].endTime;

		// Check if the current play time is ahead of the overlay's end time...
		if( currentPlayTime >= overlayEndTime && overlayEndTime !== 0 ){
			// The end time of the overlay wa reached so we destroy the overlay view.
			this.playingOverlays[i].view.destroy();

			// Remove the overlay from the array of playing overlays.
			this.playingOverlays.splice( i, 1 );

			i--; // Since we deleted an overlay i should be decreased by 1 to not disturb our for loop.
		}
	}

	// Check if an overlay needs to be displayed. 
	var nrOfOverlaysToCheck = this.overlaysSortedByStartTime.length;
	for( var i=this.overlayIndexToStartNext; i<nrOfOverlaysToCheck; i++ ){
		var overlayModel = this.overlaysSortedByStartTime[i];
		if( overlayModel.startTime > currentPlayTime || currentPlayTime === 0 ){
			// The overlay is not ready to be played yet. Since the overlays are sorted on startTime
			// we know that the rest of the overlays are not ready either so we break out of the for loop.
			break;
		} else{
			// Its time to show this overlay, so we create its view and attach a click handler to it.
			var overlayView = new ximpel.OverlayView( overlayModel );
			overlayView.render( this.$playerElement );
			overlayView.onOneClick( this.handleOverlayClick.bind(this, overlayModel, overlayView ) );

			// Add the view to an array containing the currently playing overlays.
			var overlayEndTime = overlayModel.duration > 0 ? overlayModel.startTime+overlayModel.duration : 0; // an end time of 0 means until the end of the media item.
			this.playingOverlays.push( {'view': overlayView, 'model': overlayModel, 'endTime': overlayEndTime} );
			// An overlay has now been displayed, so we make overlayIndexToStartNext point to the next overlay which is the one to be displayed next.
			this.overlayIndexToStartNext++;
		}
	}
} 



// This function defines what happens when an overlay is clicked. It is given an overlayModel and the overlayView of the 
// overlay that was clicked.
ximpel.MediaPlayer.prototype.handleOverlayClick = function( overlayModel, overlayView ){
	if( this.isPaused() ){
		// The click handler of our overlay views disappear after being clicked once
		// because we don't want the user to be able to spam-click the overlay. 
		// Because this overlay click happened while the media player was paused,
		// we ignore the click and just re-attach the click handler.
		overlayView.onOneClick( this.handleOverlayClick.bind(this, overlayModel, overlayView ) );
		ximpel.warn("MediaPlayer.handleOverlayClick(): Cannot use overlays when in a paused state!");
		return;
	}

	// Apply all variable modifiers that are defined for the overlay that was clicked.
	this.player.applyVariableModifiers( overlayModel.variableModifiers );

	// Determine the leadsTo value for the overlay that was clicked.
	var leadsTo = this.player.determineLeadsTo( overlayModel.leadsToList );

	if( leadsTo ){
		// Check if URL is set to be displayed in iframe
		var urlAttr = 'url:';
		if (leadsTo.toLowerCase().indexOf(urlAttr) === 0){
			// Re-attach overlay click handler if playing; otherwise it already has been attached
			if( this.isPlaying() ){
				this.player.pause();
				overlayView.onOneClick( this.handleOverlayClick.bind(this, overlayModel, overlayView ) );
			}

			// Generate iframe with close button and inject into DOM
			var url = leadsTo.substr(urlAttr.length);
			$player = this.player;
			$urlDisplay = $('<div class="urlDisplay"></div>');

			$closeButton = $('<img class="closeButton" src="ximpel/images/close_button.png"/>')
				.one('click', function(){
					this.pubSub.publish( this.EVENT_IFRAME_CLOSE, {
						$iframe: $urlDisplay.find('iframe'),
						url: url,
					});
					$urlDisplay.remove();
					if( $player.isPaused() ){
						$player.resume();
					}
				}.bind(this));

			$urlDisplay.append( $('<iframe src="' + url + '"></iframe>') )
				.append( $closeButton )
				.appendTo( this.player.getPlayerElement() );

			this.pubSub.publish( this.EVENT_IFRAME_OPEN, {
				$iframe: $urlDisplay.find('iframe'),
				url: url,
			});

		} else{
			// start playing the subject specified in the leadsTo
			this.player.goTo( leadsTo );
		}
	}
}



// This method checks whether the media item has reached its duration limit (as specified in the playlist)
// A duration of "0" means it will be played indefinitely.
ximpel.MediaPlayer.prototype.checkMediaItemDuration = function( currentPlayTime ){
	var allowedPlayTime = this.mediaModel.duration || 0;

	if( currentPlayTime >= allowedPlayTime && allowedPlayTime !== 0 ){
		this.handleDurationEnd();
	}
}



// This function is called when a media item has come to an end either because the specified duration has been exceeded or
// because there is nothing more to play (the video reached the end for example).
ximpel.MediaPlayer.prototype.handleMediaEnd = function(){
	this.mediaHasEnded = true;

	// If the media item should be repeated (indicated by mediaModel.repeat) then we just replay the media item and do nothing.
	// The user must click an overlay (or any other interaction) to proceed. The media item will replay indefinitely.
	// Note this only repeats the media item itself and not all the overlays/questions/etc. that are defined to play during
	// this media item.
	if( this.mediaModel.repeat ){
		this.replayMediaItem();
		return;
	}

	this.turnOffMediaPlayerUpdates();
	this.mediaItem.pause();

	// If the media model that is being played by this mediaPlayer has specified a subject in its leadsTo attribute then we we tell
	// the player to play that subject. The player will start playing a new subject immediately, so we should not do anything after that anymore.
	var leadsTo = this.player.determineLeadsTo( this.mediaModel.leadsToList );
	if( leadsTo ){
		this.player.goTo( leadsTo );
	} else{
		// if no subject was specified to play next by the mediaModel, then the media player will throw its end event.
		// The component that listens for that event will be in control from then on (ie. the sequence player or maybe 
		// a parallel player)
		this.pubSub.publish( this.EVENT_MEDIA_PLAYER_END );
	}
}



// This function is the handler function for when the media item has ended. This will only ever be called if the media item has an 
// ending (such as a video). Media items like images can play indefinitely and because of that they will never throw an end event.
// Note that this handler function is not called when the media item exceeds its duration.
ximpel.MediaPlayer.prototype.handlePlaybackEnd = function(){
	// In this function we can specify any task that needs to be executed when the media has come to its playback end and thus
	// has nothing more to play.
	this.handleMediaEnd();
} 



// This function is the handler function for when the media item's playing duration has been exceeded. This will not be called when the
// media item has come to its playback end.
ximpel.MediaPlayer.prototype.handleDurationEnd = function(){
	// In this function we can specify any task that needs to be executed when the media has been playing longer than its maximum duration.
	this.handleMediaEnd();
}



// This method replays a media item (only the media item not the overlays or anything else).
ximpel.MediaPlayer.prototype.replayMediaItem = function(){
	this.totalPlayTime += this.getPlayTime();
	this.mediaItem.stop();
	this.mediaItem.play();
}



// Returns the total playtime of the mediaModel
ximpel.MediaPlayer.prototype.getTotalPlayTime = function(){
	return this.totalPlayTime + this.getPlayTime();
}



// This method is used to keep track of how long a media item has been playing. Whenever the media item changes from or to
// a pause, play or stop state this method is called to update a play timestamp and a pause timestamp which together can indicate
// how long the media item has been playing.  Playtime tracking works as follows:
// As long as the media player is playing, the pauseTimestamp will be 0 and the playTimestamp will be a timestamp
// such that: Date.now() - playTimestamp = <playTimeOfMediaItem>. However if we go into a pause state, the playTimestamp
// will not be accurate anymore because for some of the time between Date.now() - playTimestamp we were not playing but pausing.
// So whenever we move to a playing state we add the paused time to the playTimestamp so that the paused time does not add up to 
// the play time. Changing to a stop state causes both timestamps to reset.
ximpel.MediaPlayer.prototype.updatePlayTimeTracking = function( stateChange ){
	if( stateChange === this.STATE_PLAYING ){
		// Calculate the time between Date.now() and the timestamp at which the media player was paused. This is the pause time.
		var pauseTime = (this.pauseTimestamp === 0) ? 0 : (Date.now()-this.pauseTimestamp);

		// If no playTimestamp is set then we initialize it to the current time. If the playTimestamp was already initialized then 
		// we add the pauseTime to it so that the time that the media player was paused doesnt add up the play time of the media item.
		// that the play timestamp refers to the time the media was actually playing.
		this.playTimestamp = this.playTimestamp === 0 ?	Date.now() : (this.playTimestamp+pauseTime);

		// Reset the pause timestamp because we already added this paused time to the playtimestamp.
		this.pauseTimestamp = 0;
	} else if( stateChange === this.STATE_PAUSED ){
		// Set the pause timestamp to Date.now() but only if a timestamp was not already set. If a timestamp was already set then we were already in a paused 
		// state. We know that because the pause timestamp is reset whenever we go from a paused state to a non-paused state, ie. play or stop state).
		this.pauseTimestamp = this.pauseTimestamp === 0 ? Date.now() : this.pauseTimestamp;
	} else if( stateChange === this.STATE_STOPPED ){
		// When we move to a stop state, both timestamps are reset because all media player state is lost when doing a stop().
		this.playTimestamp = 0 ;
		this.pauseTimestamp = 0 ;
	}
}



// getPlayTimeDefault() is the default way for the mediaPlayer to determine how long the media item has been playing (in miliseconds). It is based
// on how long the media item has been in a playing state. However, this may not be accurate if there are streaming issues for example. So this method
// is only used if the media item does not provide its own getPlayTime() method. The media item may be able to provide a more accurate getPlayTime value
// because it can look at the playback time of the video for example (in the case of a Video media item)
ximpel.MediaPlayer.prototype.getPlayTimeDefault = function(){
	// We first determine the pause time which is 0 if we are not in the paused state because whenever we move from a paused state to a non-paused state
	// we substract the paused time from the play time and set the pause time to 0. If we are in the paused state then the pause time is the difference 
	// between Date.now() and the pauseTimestamp.
	var currentTimestamp = Date.now();
	var pauseTime = this.pauseTimestamp === 0 ? 0 : (currentTimestamp-this.pauseTimestamp);

	// Return the time that the media item has actually been playing. 
	var playTime = currentTimestamp - this.playTimestamp + pauseTime;
	return playTime;
}



// Turn on media player updates (ie. checking for changes in overlays, questions, etc.).
ximpel.MediaPlayer.prototype.turnOnMediaPlayerUpdates = function(){
	this.mediaPlayerUpdateHandler = setTimeout( function(){
		this.turnOnMediaPlayerUpdates();
		this.updateMediaPlayer();
	}.bind(this), this.MEDIA_PLAYER_UPDATE_INTERVAL );
}



// Turn off media player updates (ie. checking for changes in overlays, questions, etc.).
ximpel.MediaPlayer.prototype.turnOffMediaPlayerUpdates = function(){
	if( this.mediaPlayerUpdateHandler ){
		clearTimeout( this.mediaPlayerUpdateHandler );
	}
	this.mediaPlayerUpdateHandler = null;
}



// Destroy all overlay views.
ximpel.MediaPlayer.prototype.destroyPlayingOverlays = function(){
	this.playingOverlays.forEach( function( playingOverlay ){
		playingOverlay.view.destroy();
	}.bind(this) );
}



// Return a new array containing the overlayModels from the given array sorted by startTime.
ximpel.MediaPlayer.prototype.getOverlaysSortedByStartTime = function( overlays ){
	// overlays.slice() creates a copy of the overlays array and then sort() sorts them by start time.
	var overlaysSorted = overlays.slice().sort( function( overlay1, overlay2 ){
		if (overlay1.startTime === overlay2.startTime) {
			// Some browser implementations of Array.sort are non-stable, so
			// compare the indexes to retain the current order (stable sort)
			return overlay1.index - overlay2.index;
		}
		return overlay1.startTime - overlay2.startTime;
	} );
	
	// Return the copy of the overlays array
	return overlaysSorted;
}



ximpel.MediaPlayer.prototype.addEventHandler = function( event, callback ){
	this.pubSub.subscribe( event, callback );
	return this;
}



ximpel.MediaPlayer.prototype.clearEventHandlers = function( callback ){
	this.pubSub.reset();
	return this;
}



ximpel.MediaPlayer.prototype.isPlaying = function(){
	return this.state === this.STATE_PLAYING;
}



ximpel.MediaPlayer.prototype.isPaused = function(){
	return this.state === this.STATE_PAUSED;
}



ximpel.MediaPlayer.prototype.isStopped = function(){
	return this.state === this.STATE_STOPPED;
}



ximpel.MediaPlayer.prototype.resetPlayTime = function(){
	this.pauseTimestamp = 0;
	this.playTimestamp = 0;
}



ximpel.MediaPlayer.prototype.resetTotalPlayTime = function(){
	this.totalPlayTime = 0;
}
// QuestionManager()
// The QuestionManager is used to take over some work from the MediaPlayer so that
// the MediaPlayer doesn't get cluttered too much. The MediaPlayer just asks the 
// QuestionManager to update() which cause the QuestionManager to check if any question lists
// need to be started or stopped.
//
// QuestionLists are started and stopped by adding them to a Queue. When the startTime of the
// QuestionList is reached then the list is put into the queue to be started. The reason we do this
// is because one question list may still be in progress while the next one is already about to start.
// When a question list ends, the queue is checked for the next question list.
//
// Note: all questions are part of a question list. Even if you only used the <question> tag
// in the playlist and not the <questions> tag. In that case the Parser created a QuestionListModel
// specific for that question (ie. a list of one question).

// Public methods:
// - update() - checks whether a question list are ready to be started or a question has exceeded its timelimit.
// - use() - Resets the question manager and makes it use a different array of question lists to play.
// -  destory() - detroys any active question

ximpel.QuestionManager = function( player, $el, getPlayTime, questionLists ){
	this.player = player;
	this.$el = $el;

	// The getPlayTime argument is a function pointer. 
	// The QuestionManager uses it to get the current playtime of the media item.
	this.getPlayTime = getPlayTime;

	// Will hold the QuestionListModels that are queued (ie. ready to be played)
	this.queuedQuestionLists = [];

	// Will hold the question list model that is currently being played.
	this.currentQuestionListModel = null;

	// Will hold the question that is currently being played
	this.currentQuestion = null;

	// Will hold the questons list models ordered by start time.
	this.questionListsSortedByStartTime = null;

	// Will hold the index into the questionListsSortedByStartTime array of the
	// question list that is to be started next (the indexes before it should already
	// have been started)
	this.questionListIndexToQueueNext = 0;
	this.questionIndexToStartNext = 0;
	
	if( questionLists ){
		this.use( questionLists, true );
	}
}



// Let this QuestionManager manage the given list of QuestionListModels
ximpel.QuestionManager.prototype.use = function( questionLists, preventReset ){
	// Normally we reset the QuestionListManager to its original state when
	// we start using different QuestionLists. But if we know the QuestionManager
	// is already in its default state then we can prevent it from resetting.
	if( !preventReset ){
		this.reset();
	}
	// Take the list of overlays from the new questionLists and store them sorted by starttime.
	this.questionListsSortedByStartTime = this.getQuestionListsSortedByStartTime( questionLists );
}



// Reset the QuestionManager into its default state.
ximpel.QuestionManager.prototype.reset = function(){
	if( this.currentQuestion ){
		this.currentQuestion.view.destroy();
	}
	this.queuedQuestionLists = [];
	this.currentQuestionListModel = null;
	this.questionListsSortedByStartTime = null;
	this.questionListIndexToQueueNext = 0;
	this.currentQuestion = null;
	this.questionIndexToStartNext = 0;
}



// This method tells the QuestionManager to check if something needs to be started/stopped.
// It requires the currentPlayTime of the media item, since the starting and stopping of
// questions is relative to the beginning of the media item.
ximpel.QuestionManager.prototype.update = function( currentPlayTime ){
	// Check if there are question lists that are ready to be played (ie. their starttime has been reached). if so, then
	// we add them to the list of queued question-lists. The question lists will be played in FIFO order.
	this.checkForQuestionListsToQueue( currentPlayTime );

	// If there is a currentQuestion and there is a current QuestionList then
	// we check if that question must be ended (because of its timelimit)
	if( this.currentQuestion && this.currentQuestionListModel ){
		if( currentPlayTime >= this.currentQuestion.endAt && this.currentQuestion.endAt !== 0 ){
			var view = this.currentQuestion.view;
			// If the question is not yet answered then we hide the question now because the time has passed.
			if( view.isAnswered !== true ){
				view.hideQuestion(); 
			}
		}
	}

	// If there are question lists that are queued for playback and no questionlist 
	// is currently in progress then play the next question list.
	if( this.queuedQuestionLists.length > 0 && !this.currentQuestionListModel && currentPlayTime > 0 ){
		this.playNextQuestionListInQueue( currentPlayTime );
	}
}



// This stops the QuestionManager, causing the current question view to be destroyed.
ximpel.QuestionManager.prototype.stop = function(){
	this.reset();
}



// Check if a QuestionList must be added to the queue for playback.
ximpel.QuestionManager.prototype.checkForQuestionListsToQueue = function( currentPlayTime ){
	for( var i=this.questionListIndexToQueueNext; i<this.questionListsSortedByStartTime.length; i++ ){
		var questionListModel = this.questionListsSortedByStartTime[i];
		if( questionListModel.startTime > currentPlayTime ){
			// The questionlist 'i' does not start yet, so all questionlists after it are
			// also not ready to start yet (they are order by startime).
			return;
		}
		this.queuedQuestionLists.push( questionListModel );
		this.questionListIndexToQueueNext++;
	}
}



// This method starts playing the next question list in the queue by playing the first
// question in that question list.
ximpel.QuestionManager.prototype.playNextQuestionListInQueue = function( currentPlayTime ){
	var questionListModel = this.queuedQuestionLists.shift(); // get and remove first item from the array.
	if( questionListModel ){
		this.currentQuestionListModel = questionListModel;
		this.playQuestion( this.questionIndexToStartNext, currentPlayTime );
	}
}


// Start playing a question.
ximpel.QuestionManager.prototype.playQuestion = function( index, currentPlayTime ){
	var questionModel = this.currentQuestionListModel.questions[index];
	var questionView = new ximpel.QuestionView( questionModel );

	// The default time limit for all questions in the current question list.
	var defaultTimeLimit = this.currentQuestionListModel.questionTimeLimit;

	// The specific time limit for this question.
	var questionTimeLimit = questionModel.questionTimeLimit;

	// the actual time limit for this question (a time limit of 0 means unlimited)
	var actualTimeLimit = ( !questionTimeLimit && questionTimeLimit !== 0 ) ? defaultTimeLimit : questionTimeLimit;

	// The play time at which the question should stop. (endAt of 0 means there is no end time)
	var endAt = actualTimeLimit === 0 ? 0 : (currentPlayTime+actualTimeLimit);

	// Safe the current question that is being played and all info/object related to this question.
	this.currentQuestion = {
		'index': index,
		'model': questionModel,
		'view': questionView,
		'endAt': endAt
	};

	// The index of the questionList.questions array to play after this question finishes.
	this.questionIndexToStartNext = index+1;

	// When the question is answered...
	questionView.addEventHandler( questionView.EVENT_QUESTION_ENDED, this.handleQuestionAnswer.bind(this, questionModel ) );

	// When the question is ended the nextQuestion() function is called.
	questionView.addEventHandler( questionView.EVENT_QUESTION_ENDED, this.nextQuestion.bind(this) );
	questionView.render( this.$el );
}



// This method handles what to do when a question is answered.
ximpel.QuestionManager.prototype.handleQuestionAnswer = function( questionModel, chosenOption ){
	if( questionModel.answer === chosenOption ){
		// If the question is right we apply the variable modifiers for this question.
		// If there are any modifiers for this question, then the player's variables will have
		// changed after this.
		this.player.applyVariableModifiers( questionModel.variableModifiers );
	}
}



// This stops the current question and starts playing the next question.
// If there is no next question in the current question list then the
// question list is stopped. A new question list will be started from the queue
// (if any) when the update() method is called again.
ximpel.QuestionManager.prototype.nextQuestion = function(){
	this.currentQuestion.view.destroy();
	this.currentQuestion = null;
	if( this.hasNextQuestion() ){
		this.playQuestion( this.questionIndexToStartNext, this.getPlayTime() );
	} else{
		this.stopQuestionList();
	}
}



// Check if the question list has a next question.
ximpel.QuestionManager.prototype.hasNextQuestion = function(){
	return this.currentQuestionListModel.questions[this.questionIndexToStartNext] ? true : false;
}


// Stop the current question list.
ximpel.QuestionManager.prototype.stopQuestionList = function(){
	this.questionIndexToStartNext = 0;
	this.currentQuestionListModel = null;
}



// This method sorts the array of question lists that is passed as an argument. The method returns a new array
// containing the question lists but order by start time (ie. the first question list to start is index 0).
ximpel.QuestionManager.prototype.getQuestionListsSortedByStartTime = function( questionLists ){
	// overlays.slice() creates a copy of the overlays array and then sort() sorts them by start time.
	var questionListsSorted = questionLists.slice().sort( function( questionList1, questionList2 ){
		return questionList1.startTime - questionList2.startTime;
	} );
	
	// Return the copy of the overlays array
	return questionListsSorted;
}
// SequencePlayer
// The XIMPEL Player plays subjects and each subject has a SequenceModel which contains
// the list of things that need to be played (videos, audio, etc.) The SequencePlayer
// plays this SequenceModel. It makes sure that each item is played one after another.
// ############################################################################

ximpel.SequencePlayer = function( player, sequenceModel ){
	// The SequencePlayer uses and is used by the Player() object and as such it has a reference to it and all of the Player()'s data.
	this.player = player;

	// The parallel player is used when the sequence contains a parallel model. These are played by the parallel player.
	//this.parallelPlayer = new ximpel.ParallelPlayer(); // not yet implemented.
	
	// The media player is used when the sequence ontains a media model. These are played by the media player.
	this.mediaPlayer = new ximpel.MediaPlayer( player );

	// Register a callback function for when the media player finishes playing the media model.
	this.mediaPlayer.addEventHandler( this.mediaPlayer.EVENT_MEDIA_PLAYER_END, this.handleMediaPlayerEnd.bind(this) );

	// This will contain the sequence model that is being played by the sequence player.
	this.sequenceModel = null;

	// This points to the index in the sequence model's list of items.
	this.currentSequenceIndex = 0;

	// This will hold the model that is currently being played. note that this can either be a mediaModel or a parallelModel.
	this.currentModel = null;

	// PubSub is used to subscribe callback functions for specific events and to publish those events to the subscribers.
	this.pubSub = new ximpel.PubSub();

	// Initialize the sequence player's state to the stopped state.
	this.state = this.STATE_STOPPED;

	// If a sequence model has been specified then use that sequence model which will be played by the sequence model.
	if( sequenceModel ){
		this.use( sequenceModel, true );
	}
};
ximpel.SequencePlayer.prototype.EVENT_SEQUENCE_END = 'EVENT_SEQUENCE_END';
ximpel.SequencePlayer.prototype.STATE_PLAYING = 'state_sp_playing';
ximpel.SequencePlayer.prototype.STATE_PAUSED = 'state_sp_paused';
ximpel.SequencePlayer.prototype.STATE_STOPPED = 'state_sp_stopped';


// The use() method can be called to start using the given sequenceModel. This resets the entire SequencePlayer and will then
// use the new sequence model for playback.
ximpel.SequencePlayer.prototype.use = function( sequenceModel, preventReset ){
	// Reset this sequence player to its starting state from where it can start playing the sequence model again. If the preventReset argument
	// is set to true then the reset is not done, this can be used when you know the sequence player is in its default state already.
	if( !preventReset ){
		this.reset();
	}

	this.sequenceModel = sequenceModel;
}



// The reset function resets the sequence player into the start state from where it can start playing a sequence model again.
// After this method the sequence player has no visual elements displayed anymore. Ie. Its media player and parallel player are stopped.
ximpel.SequencePlayer.prototype.reset = function( clearRegisteredEventHandlers ){
	this.mediaPlayer.stop();
	this.state = this.STATE_STOPPED;
	this.currentModel = null;
	this.currentSequenceIndex = 0;

	if( clearRegisteredEventHandlers ){
		this.clearEventHandlers(); 		// resets the pubsub of the sequence player so that all registered callbacks are unregistered.
	}
}



// Start playing the current sequence model or if one is specified as an argument then play that SequenceModel
ximpel.SequencePlayer.prototype.play = function( sequenceModel ){
	// If a sequence model is specified as an argument then we use it. This resets the sequence player, causing it to stop
	// playing whaterver is is currently playing and return into a stopped state where it can start playing again.
	if( sequenceModel ){
		this.use( sequenceModel );
	}

	// If no sequence model is specified as an argument nor is one set at an earlier moment, then there
	// is nothing to play so give an error message and return.
	if( !this.sequenceModel ){
		ximpel.error("SequencePlayer.play(): cannot start playing because no sequence model has been specified.");
		return;
	}

	// Ignore this play() call if the sequence player is already playing (ie. is in a playing state).
	if( this.isPlaying() ){
		ximpel.warn("SequencePlayer.play(): play() called while already playing.");
		return this;
	} else if( this.isPaused() ){
		// The player is in a paused state so we just resume.
		this.resume();
		return this;
	}

	// Indicate that we are in a playing state.
	this.state = this.STATE_PLAYING;

	// Call the playback controller which will determine what to play.
	this.playbackController();
	return this;
}



// The playback controller decides what should be played next.
ximpel.SequencePlayer.prototype.playbackController = function(){
	var itemToPlay =  this.getNextItemToPlay();

	if( !itemToPlay ){
		// There is no next item to play in the current sequence so we throw an event to the
		// Player object indicating that the sequence player finished playing its sequence model.
		// Publish the sequence-end-event which will call events registered for that event.
		this.pubSub.publish( this.EVENT_SEQUENCE_END );
	} else if( itemToPlay instanceof ximpel.MediaModel ){
		// The item to play is a mediaModel... so we will play a media model.
		this.playMediaModel( itemToPlay );
		this.currentSequenceIndex++;
	} else if( itemToPlay instanceof ParallelMediaModel ){
		// The item to play is a parallel model... so we will play a parallel model.
		// .... Not yet implemented parallel media items....
		// this.playParallelModel()
	}
}



// Resume playing the sequence model.
ximpel.SequencePlayer.prototype.resume = function(){
	// Ignore this resume() call if the sequence player is already in a playing state.
	if( !this.isPaused() ){
		ximpel.warn("SequencePlayer.resume(): resume() called while not in a paused state.");
		return this;
	}

	if( this.currentModel instanceof ximpel.MediaModel ){
		// the model that is currently being played is a media model.
		// Media models are played by a media player so we resume the media player.
		this.mediaPlayer.resume();
	} else if( itemToPlay instanceof ParallelMediaModel ){
		// The model that is currently being played is a parallel model. 
		// Parallel models are played by a parallel player so we resume the parallel player.
		// ... parallel player not implemented yet.... 
	}

	// Indicate the sequence player is now in a playing state again.
	this.state = this.STATE_PLAYING;

	return this;
}



// Start playing a media model.
ximpel.SequencePlayer.prototype.playMediaModel = function( mediaModel ){
	this.currentModel = mediaModel;

	// Apply all variable modifiers that were defined for the mediaModel that is about to be played.
	this.player.applyVariableModifiers( mediaModel.variableModifiers );

	this.mediaPlayer.play( mediaModel );
}



// Pause the sequence player.
ximpel.SequencePlayer.prototype.pause = function(){
	// Ignore this pause() call if the sequence player is not in a playing state.
	if( ! this.isPlaying() ){
		ximpel.warn("SequencePlayer.pause(): pause() called while not in a playing state.");
		return this;
	}

	// Indicate that we are in a paused state.
	this.state = this.STATE_PAUSED;

	// Tell the media player to pause.
	this.mediaPlayer.pause();

	return this;
}



// Stop the sequence player.
ximpel.SequencePlayer.prototype.stop = function(){
	// Ignore this stop() call if the sequence player is already in the stopped state.
	if( this.isStopped() ){
		ximpel.warn("SequencePlayer.stop(): stop() called while already in a stopped state.");
		return this;
	}

	// Indicate that we are in a stopped state.
	this.state = this.STATE_STOPPED;

	// Tell the media player to stop.
	this.reset();
	return this;
}



ximpel.SequencePlayer.prototype.isPlaying = function(){
	return this.state === this.STATE_PLAYING;
}



ximpel.SequencePlayer.prototype.isPaused = function(){
	return this.state === this.STATE_PAUSED;
}



ximpel.SequencePlayer.prototype.isStopped = function(){
	return this.state === this.STATE_STOPPED;
}



// This is the method that gets called when the media player has ended and wants to give back control to the
// sequence player. Then the sequence player will decide what to do next. 
ximpel.SequencePlayer.prototype.handleMediaPlayerEnd = function(){
	this.playbackController();
}



// Determine what the next item in the sequence is that should be played.
ximpel.SequencePlayer.prototype.getNextItemToPlay = function(){
	if( this.currentSequenceIndex < this.sequenceModel.list.length ){
		return this.sequenceModel.list[ this.currentSequenceIndex ];
	} else{
		return null;
	}
}



// Add an event handler to this sequence player.
ximpel.SequencePlayer.prototype.addEventHandler = function( event, callback ){
	this.pubSub.subscribe( event, callback );
	return this;
}



// Clear all event handlers for this sequence player.
ximpel.SequencePlayer.prototype.clearEventHandlers = function( callback ){
	this.pubSub.reset();
	return this;
}
// MediaType()
// The media type constructor constructs objects that are used as prototype by specific media types such as video or audio.
// In other words, its a parent object for specific media types (ie. Audio, Video, Picture use this as parent object)
// For example the Video media type does:
//     ximpel.mediaTypeDefinitions.Video.prototype = new ximpel.MediaType();
// By using a generic MediaType object as the prototype for a specific media type, all the media types will
// have some common functions available. For example the following methods are available by each
// media type that uses this MediaType object as its prototype:
// addEventHandler()
// removeEventHandler()
// ended()
// play()
// pause()
// stop()
// isPlaying()
// etc.
// 
// Methods like "play" and "pause" don't do much more then forwarding the call to the mediaPlay 
// and mediaPause methods of the specific media type implementation itself. However, they generate 
// a warning in the console to indicate a media type is missing certain required functions if that is the case.
// 
// The function addEventHandler() and removeEventHandler() provides the ability to add event handlers for events
// without creating an addEventHandler() function on every media type.
// ############################################################################

ximpel.MediaType = function(){
}
ximpel.MediaType.prototype.EVENT_MEDIA_END = 'ended';


// This method will call the mediaPlay method of the specific mediaType or produce a warning if the media type doesn't have one.
ximpel.MediaType.prototype.play = function(){
	if( this.mediaPlay ){
		this.mediaPlay();
	} else{
		ximpel.error('ximpel.MediaType(): Invalid custom media type! A custom media type does not conform to the required interface. The media type has not implemented the mediaPlay() method.');
	}
	return this;
}



// This method will call the mediaPause method of the specific mediaType or produce a warning if the media type doesn't have one.
ximpel.MediaType.prototype.pause = function(){
	if( this.mediaPause ){
		this.mediaPause();
	} else{
		ximpel.error('ximpel.MediaType(): Invalid custom media type! A custom media type does not conform to the required interface. The media type has not implemented the mediaPause() method.');
	}
	return this;
}



// This method will call the mediaStop method of the specific mediaType or produce a warning if the media type doesn't have one.
ximpel.MediaType.prototype.stop = function(){
	if( this.mediaStop ){
		this.mediaStop();
	} else{
		ximpel.error('ximpel.MediaType(): Invalid custom media type! A custom media type does not conform to the required interface. The media type has not implemented the mediaStop() method.');
	}
	return this;
}



// This method will call the mediaIsPlaying() method of the specific mediaType or produce a warning if the media type doesn't have one.
ximpel.MediaType.prototype.isPlaying = function(){
	if( this.mediaIsPlaying ){
		return this.mediaIsPlaying();
	} else{
		ximpel.error('ximpel.MediaType(): Invalid custom media type! A custom media type does not conform to the required interface. The media type has not implemented the mediaIsPlaying() method.');
	}
}



// This method will call the mediaIsPaused() method of the specific mediaType or produce a warning if the media type doesn't have one.
ximpel.MediaType.prototype.isPaused = function(){
	if( this.mediaIsPaused ){
		return this.mediaIsPaused();
	} else{
		ximpel.error('ximpel.MediaType(): Invalid custom media type! A custom media type does not conform to the required interface. The media type has not implemented the mediaIsPaused() method.');
	}
}



// This method will call the mediaIsStopped() method of the specific mediaType or produce a warning if the media type doesn't have one.
ximpel.MediaType.prototype.isStopped = function(){
	if( this.mediaIsStopped ){
		return this.mediaIsStopped();
	} else{
		ximpel.error('ximpel.MediaType(): Invalid custom media type! A custom media type does not conform to the required interface. The media type has not implemented the mediaIsStopped() method.');
	}
}



// This method should be called by the parent object (such as Video() or Youtube() ) to indicate the media type has ended.
// Note that this should only be called when the media type has ran into its playback end (ie. a video has nothing more to play).
// This is not to be called when the media type has surpassed its duration as specified in the playlist file, because that is
// managed by the MediaPlayer(). ended() is used by the media player to detect when a media type has nothing more to play. This
// makes it possible to let the duration attribute in the playlist file be optional, leaving it out means playing till the media ends.
// A media type is not obliged to call ended(), for instance an image can play indefinitely so it does never call the ended() method.
ximpel.MediaType.prototype.ended = function(){
	if( this.mediaEnded ){
		this.mediaEnded();
	}
	// Throw the media end event.
	this.lazyLoadPubSub().publish( this.EVENT_MEDIA_END );
	return this;
}


// This method will call the mediaDestroy() method of the specific mediaType and destroy any generic variables used within this MediaType object.
ximpel.MediaType.prototype.destroy = function(){
	if( this.mediaDestroy ){
		return this.mediaDestroy();
	} 
	this.__mediaTypePubSub__ = null;

	return this;
}



// This method registers an event for when the media item ends (ie. it has nothing more to play)
ximpel.MediaType.prototype.onEnd = function( callback ){
	return this.addEventHandler( this.EVENT_MEDIA_END, callback );
}



// This method registers a handler function for a given event
ximpel.MediaType.prototype.addEventHandler = function( eventName, callback ){
	switch( eventName ){
		case this.EVENT_MEDIA_END:
			return this.lazyLoadPubSub().subscribe( this.EVENT_MEDIA_END, callback );
		default:
			ximpel.warn("MediaType.addEventHandler(): event type '" + eventName + "' is not supported.");    
			return null;
	}
}



// This method removes a handler function for a given event
ximpel.MediaType.prototype.removeEventHandler = function( eventName, callback ){
	switch( eventName ){
		case this.EVENT_MEDIA_END:
			this.lazyLoadPubSub().unsubscribe( this.EVENT_MEDIA_END, callback ); 
			return 	true;
		default: 
			ximpel.warn("MediaType.removeEventHandler(): event type '" + eventName + "' is not supported.");
			return false;
	}
}



ximpel.MediaType.prototype.lazyLoadPubSub = function(){
	// Lazy loading means that we do not execute this code in the constructor but we do this  
	// at the last possible moment. At that moment the 'this' keyword will point not to this
	// MediaType object but to its child (ie. a YouTube instance or Picture instance).
	// That is what we want because we want this pubSub object to be a property of the child
	// and not of the parent (otherwise the pub-sub is shared across all media type instances)
	if( ! this.__mediaTypePubSub__ ){
		// if no pub sub is created yet for this media instance then we create one now.
		// We use the weird name because we dont want people creating custom media types
		// to accidentally overwrite it inside their media type implementation.
		this.__mediaTypePubSub__ = new ximpel.PubSub();
	}
	return this.__mediaTypePubSub__;
}


// MediaTypeRegistration()
// The MediaTypeRegistration() object is used when registering a media type to XIMPEL.
// You create an instance of this object and pass it to ximpel.registerMediaType()

// ########################################################################################################################################################

ximpel.MediaTypeRegistration = function( mediaTypeId, mediaTypeConstructor, options ){
	var options = options || {};

	// The mediaTypeId is the unique identifier for the media type. It is also the tag-name of the media type in the playlist file.
	// So If the mediaTypeId is "video" then you add a video media item to the playlist like this: <video>
	this.mediaTypeId = mediaTypeId;

	// The mediaTypeConstructor points to the constructor function of this media type. This is used by the Player() object
	// in order to construct instances of the media type. So if the playlist file has a subject with four <video> tags, then
	// the player will call this constructor four times to make four video objects.
	this.mediaTypeConstructor = mediaTypeConstructor;
	
	// the "allowedAttributes" property specifies which attributes are allowed to be present on the element of this media type in the playlist.
	this.allowedAttributes = options.allowedAttributes || [];

	// the "requiredAttributes" property specifies which attributes must be present on the element of this media type in the playlist.
	this.requiredAttributes = options.reguiredAttributes || [];

	// the "allowedChildren" property specifies which XML elements are allowed be children of this media type element in the playlist file.
	this.allowedChildren = options.allowedChildren || [];

	// the "requiredChildren" property specifies which XML elements must be present as children of this media type element in the playlist file.
	this.requiredChildren = options.requiredChildren || [];
}
// PubSub()
// The PubSub object is a publish subscribe system. It allows you to subscribe a callback function 
// for a certain topic (ie. event). This is done with the subscribe(<event>,<callback>) method. Then 
// With the publish(<event>) method you can throw the event, causing all registered functions to be 
// called. This makes it easy to listen for events and throw these events. For example:
// 		var pubSub = new ximpel.PubSub();
// 		pubSub.subscribe('playerEnded', function(){
// 			alert("player has ended");
// 		} );
// then somewhere else in your code you can do:
//		pubSub.publish('playerEnded');
// which will cause your registered event handler to be called.

ximpel.PubSub = function(){
	this.topics = {};
}

// Resets the PubSub causing all subscribed functions to be lost.
ximpel.PubSub.prototype.reset = function(){
	this.topics = {};
}



// Subscribe a function for a certain event/topic.
ximpel.PubSub.prototype.subscribe = function( topic, func ){
	if( ! this.topics[topic] ){
		this.topics[topic] = [];
	}

	// add the handler function to the array of handlers for the given topic.
	this.topics[topic].push( func );

	// we return the function reference which can be used for unsubscribing the function again.
	return func; 
}



// Unsubscribe a function that was previously subscribed for a certain topic/event.
ximpel.PubSub.prototype.unsubscribe = function( topic, func ){
	// If the topic doesnt exist then there is no subscription so we just return.
	if( ! this.topics[topic] ){
		return this;
	}

	// The topic exists, so search through all subscriptions for the given topic 
	// and look for a subscription with the given token.
	var topicSubscriptions = this.topics[topic];

	for( var i=0; i<topicSubscriptions.length; i++ ){
		var subscription = topicSubscriptions[i];

		// Check if the current subscription is equal to the function which must be unsubscribed.
		if( subscription == func ){

			// the current subscription is the subscription that must be unsubscribed so we splice it out of the array.
			topicSubscriptions.splice( i, 1 ); 
			
			// We removed a subscription, now we check if there are any subscriptions left, if not, we remove the topic.
			if( topicSubscriptions.length <= 0 ){
				delete this.topics[topic];
			}
		}
	}

	return this;
}



// Publish an event/topic. This causes all subscribed functions for that event/topic to be called.
ximpel.PubSub.prototype.publish = function( topic, data ){
	// Check if there are any subscribers for this topic, if not we just return.
	if( !this.topics[topic] || this.topics[topic].length <= 0 ){
		return this;
	}

	var topicSubscriptions = this.topics[topic];
	for( var i=0; i<topicSubscriptions.length; i++ ){
		var callback = topicSubscriptions[i];
		callback( data );
	}
	
	return this;
}



// This method deletes a specific topic. Causing all registered functions for 
// that topic/event to be removed.
ximpel.PubSub.prototype.deleteTopic = function( topic ){
	delete this.topics[topic];
	return this;
}



// Checks whether there are subscribed functions for the given topic/event.
ximpel.PubSub.prototype.hasSubscribers = function( topic ){
	if( this.topics[topic] && this.topics[topic].length > 0 ){
		return true;
	}
}
// XimpelApp()
// The XimpelAppView object creates the main XIMPEL elements (such ass the appElement,
// a wrapper element, the player element, the controls element, control buttons, etc.)
// It draws these elements based on the XimpelApp model which contains all information needed to do this.


// TODO: 
// - Right now the keypress handlers dont work.


ximpel.XimpelAppView = function( ximpelAppModel, appElement, specifiedAppWidth, specifiedAppHeight ){
	// The app element is the main ximpel element. If no element is specified one will be created.
	this.$appElement = this.determineAppElement( appElement );
	
	// All view implementations should call the init method of their prototype.	
	this.init( ximpelAppModel, this.$appElement );

	// the width and height of the app element initially (including the units: px or % or w/e) this
	// specifies how large the app will appear on the page. However the width/height of the app can 
	// change when the fullscreen button is pressed.
	this.initialAppWidth = this.determineAppWidth( specifiedAppWidth );
	this.initialAppHeight = this.determineAppHeight( specifiedAppHeight );

	// The $playerElement will contain the html content of the presentation. In otherwords all media items,
	// overlays, question forms, etc. for this presentation will be attached to the $playerElement.
	this.$playerElement = $('<div></div>');
	this.$controlsElement = $('<div></div>');
	this.$wrapperElement = $('<div></div>');
	this.$playButtonElement = $('<div></div>');
	this.$pauseButtonElement = $('<div></div>');
	this.$stopButtonElement = $('<div></div>');
	this.$fullscreenButtonElement = $('<div></div>');
	
	// The PubSub object is used internally to register callback functions for certain events.
	this.pubSub = new ximpel.PubSub();

	// Initialize the main ximpel elements.
	this.initElements();
}
// Create a new View() object and set it as the prototype for XimpelAppView(). 
// This means that all instances of XimpelAppView will have that View() object as prototype.
ximpel.XimpelAppView.prototype = new ximpel.View();
ximpel.XimpelAppView.prototype.DEFAULT_XIMPEL_APP_ELEMENT_ID = 'XIMPEL';

// Define some z-indexes for the different elements. This specifies which elements will be above
// which other elements. For example the player element has a z-index of <base>+1000 and the controls
// have a z-index of <base>+2000. This means that all the player element's children will need to have a z-index
// between <base>+1000 en <base>+2000
ximpel.XimpelAppView.prototype.Z_INDEX_BASE_MAIN_ELEMENTS = 16000000;
ximpel.XimpelAppView.prototype.Z_INDEX_CONTROLS = ximpel.XimpelAppView.prototype.Z_INDEX_BASE_MAIN_ELEMENTS+2000;
ximpel.XimpelAppView.prototype.Z_INDEX_PLAYER = ximpel.XimpelAppView.prototype.Z_INDEX_BASE_MAIN_ELEMENTS+1000;

// The native width and height of the XIMPEL app. All content within the appElement will be scaled
// from 1920*1080 to the appWidth/appHeight (while maintaining aspect ratio). So when specify X and Y
// coordinates for overlays or media items in your presentation you must do so based on a 1920*1080
// resolution even if your appWidth/appHeight is smaller because ximpel will scale it for you.
ximpel.XimpelAppView.prototype.NATIVE_PLAYER_ELEMENT_WIDTH = '1920px';
ximpel.XimpelAppView.prototype.NATIVE_PLAYER_ELEMENT_HEIGHT = '1080px';

// The default width/height of your app. (ie. the dimensions that the ximpel will appear in on your page.)
ximpel.XimpelAppView.prototype.DEFAULT_APP_WIDTH = '1024px';
ximpel.XimpelAppView.prototype.DEFAULT_APP_HEIGHT = '576px';

// Defines the default width/height of the control buttons (and with that the entire controlsbar)
ximpel.XimpelAppView.prototype.DEFAULT_CONTROL_HEIGHT = '125px';
ximpel.XimpelAppView.prototype.DEFAULT_CONTROL_WIDTH = '125px';

// The class name for the main ximpel appElement
ximpel.XimpelAppView.prototype.APP_ELEMENT_CLASS = 'ximpelApp';

// The class name for the wrapper element.
ximpel.XimpelAppView.prototype.WRAPPER_ELEMENT_CLASS = 'ximpelWrapper';

// The class name for the player element
ximpel.XimpelAppView.prototype.PLAYER_ELEMENT_CLASS = 'ximpelPlayer'; 

// The class name for the control bar element.
ximpel.XimpelAppView.prototype.CONTROLS_CLASS = 'ximpelControls'; 

// The class name for the control button elements
ximpel.XimpelAppView.prototype.CONTROL_CLASS = 'ximpelControl'; 

// The class name for the controls bar when the controls bar is displayed as an overlay.
ximpel.XimpelAppView.prototype.CONTROLS_DISPLAY_METHOD_OVERLAY_CLASS = 'ximpelControlsOverlay';

// The class name for the controls bar when the controls bar is displayed fixed (not displayed as an overlay but below the player element)
ximpel.XimpelAppView.prototype.CONTROLS_DISPLAY_METHOD_FIXED_CLASS = 'ximpelControlsFixed'; 

// Two constants that indicate the display types for the controls bar (fixed or overlay)
ximpel.XimpelAppView.prototype.CONTROLS_DISPLAY_METHOD_OVERLAY = 'overlay';
ximpel.XimpelAppView.prototype.CONTROLS_DISPLAY_METHOD_FIXED = 'fixed';

ximpel.XimpelAppView.prototype.PLAY_EVENT = 'play_button_clicked';
ximpel.XimpelAppView.prototype.PAUSE_EVENT = 'pause_button_clicked';
ximpel.XimpelAppView.prototype.STOP_EVENT = 'stop_button_clicked';



// Initialize all the ximpel elements (ie. specify some initial styling for those elements)
ximpel.XimpelAppView.prototype.initElements = function(){
	this.initAppElement();
	this.initPlayerElement();
	this.initControlsElement();
	this.initWrapperElement();
	this.initButtonElements();
}



// The app element is just the main element to which all other elements are attached.
ximpel.XimpelAppView.prototype.initAppElement = function(){
	this.$appElement.css({
		'position': 'relative',
		'width': this.initialAppWidth,
		'height': this.initialAppHeight
	});

	this.$appElement.addClass( this.APP_ELEMENT_CLASS );
}



// The player element is the element to which the Player() object attaches all the DOM elements that
// form the presentation (overlays, questions, media items, etc.).
ximpel.XimpelAppView.prototype.initPlayerElement = function(){
	this.$playerElement.css({
		'position': 'absolute',
		'top': '0px',
		'left': '0px',
		'width': this.NATIVE_PLAYER_ELEMENT_WIDTH,
		'height': this.NATIVE_PLAYER_ELEMENT_HEIGHT,
		'z-index': this.Z_INDEX_PLAYER
	});
	this.$playerElement.addClass( this.PLAYER_ELEMENT_CLASS );
	this.$playerElement.appendTo( this.$wrapperElement );
}



// The controls element is the controls bar that contains the control buttons.
ximpel.XimpelAppView.prototype.initControlsElement = function(){
	this.$controlsElement.hide();
	this.$controlsElement.css({
		'position': 'absolute',
		'top': this.$playerElement.height() +'px',
		'left': '0px',
		'width': '100%',
		'height': this.DEFAULT_CONTROL_HEIGHT,
		'z-index': this.Z_INDEX_CONTROLS
	});
	this.updateControlsElementClass();
	this.$controlsElement.appendTo( this.$wrapperElement );
}



// The wrapperElement is just a wrapper around the content of the ximpel presentation. When the size of the wrapper 
// element changes, then the content is scaled to fit within the container element taking up as much space as possible
// while maintining the original aspect ratio.
ximpel.XimpelAppView.prototype.initWrapperElement = function(){
	this.$wrapperElement.css({
		'position': 'absolute',
		'top': '0px',
		'left': '0px',
		'width': this.$playerElement.width() + 'px',
		'height': this.$playerElement.height() + 'px'
	});

	this.$wrapperElement.addClass( this.WRAPPER_ELEMENT_CLASS );
	this.$wrapperElement.appendTo( this.$appElement );
}



// This initializes the elements that represent the control buttons of the presentation.
ximpel.XimpelAppView.prototype.initButtonElements = function(){
	var buttonWidth = this.DEFAULT_CONTROL_HEIGHT;
	var buttonHeight = this.DEFAULT_CONTROL_WIDTH;
	this.initButtonElement( this.$playButtonElement, 'ximpel/images/play_button.png', 'left', buttonWidth, buttonHeight, this.playHandler.bind(this) );
	this.initButtonElement( this.$pauseButtonElement, 'ximpel/images/pause_button.png', 'left', buttonWidth, buttonHeight, this.pauseHandler.bind(this) );
	this.initButtonElement( this.$stopButtonElement, 'ximpel/images/stop_button.png', 'left', buttonWidth, buttonHeight, this.stopHandler.bind(this) );
	this.initButtonElement( this.$fullscreenButtonElement, 'ximpel/images/fullscreen_button.png', 'right', buttonWidth, buttonHeight, this.fullscreenHandler.bind(this) );
}



// This initializes one specific control button element.
ximpel.XimpelAppView.prototype.initButtonElement = function( $buttonElement, backgroundImage, floatDirection, buttonWidth, buttonHeight, handler ){
	$buttonElement.css({
		'float': floatDirection,
		'background-image': 'url('+backgroundImage+')',
		'background-size': 'cover',
		'height': buttonHeight,
		'width': buttonWidth,

	});
	$buttonElement.hover( function(){
		$(this).css('cursor', 'pointer');
	}, function(){
		$(this).css('cursor', 'default');
	} );
	$buttonElement.addClass( this.CONTROL_CLASS );
	$buttonElement.on('click', handler );
	$buttonElement.hide();
	$buttonElement.appendTo( this.$controlsElement );
}



// The renderView() method is mandatory to implement for any object that wants to be a view and has a View() object as prototype.
// This renderView() will be run when render() is called which is implemented in the prototype (a View() object).
// So this is called when doing: new ximpel.XimpelAppView(...).render();
ximpel.XimpelAppView.prototype.renderView = function( $parentElement ){
	var model = this.model;
	var $parentElement = $parentElement || this.$appElement.parent();


	if( !$parentElement || $parentElement.length <= 0 ){
		// there is no parent DOM element specified to attach to, so we just attach to the body element.
		$parentElement = $( document.body );
	}
	
	// We need to append the appElement now (if its not already) because if the app element is not attached
	// to the DOM yet then we cannot reliably determine the height of elements using javascript.
	if( this.$appElement.parent().length <= 0 ){
		this.$appElement.appendTo( $parentElement );
	}

	this.renderControls();
	this.renderWrapper();
	this.listenForWindowResize();
	this.listenForKeyPresses();
	this.listenForFullscreenChange();
}




ximpel.XimpelAppView.prototype.renderControls = function(){
	if( ! this.controlsEnabled() ){
		return;
	}
	this.updateControlsElementClass();
	var controlsPosition = this.determineControlsPosition();
	this.$controlsElement.css({
		'left': controlsPosition.x + "px",
		'top': controlsPosition.y + "px"
	});

	this.$controlsElement.show();
	this.renderControlButtons();
}




ximpel.XimpelAppView.prototype.renderControlButtons = function(){
	var buttonHeight = this.$controlsElement.height();
	var buttonWidth = buttonHeight;

	if( this.model.appReadyState === this.model.APP_READY_STATE_READY ){
		this.renderPlaybackButtons( buttonWidth, buttonHeight );
	}

	this.$fullscreenButtonElement.show();
}




ximpel.XimpelAppView.prototype.renderPlaybackButtons = function( buttonWidth, buttonHeight ){
	if( this.model.playerState === this.model.PLAYER_STATE_PLAYING ){
		this.$playButtonElement.hide();
		this.$pauseButtonElement.show();
		this.$stopButtonElement.show();	
	} else if( this.model.playerState === this.model.PLAYER_STATE_PAUSED ){
		this.$pauseButtonElement.hide();
		this.$playButtonElement.show();
		this.$stopButtonElement.show();	
	} else if( this.model.PLAYER_STATE_STOPPED ){
		this.$pauseButtonElement.hide();
		this.$stopButtonElement.hide();	
		this.$playButtonElement.show();
	}
}



ximpel.XimpelAppView.prototype.fullscreenHandler = function(){
	this.toggleFullscreen();
}



ximpel.XimpelAppView.prototype.playHandler = function(){
	this.pubSub.publish( this.PLAY_EVENT );
}



ximpel.XimpelAppView.prototype.pauseHandler = function(){
	this.pubSub.publish( this.PAUSE_EVENT );
}



ximpel.XimpelAppView.prototype.stopHandler = function(){
	this.pubSub.publish( this.STOP_EVENT );
}



ximpel.XimpelAppView.prototype.registerPlayHandler = function( handler ){
	return this.pubSub.subscribe( this.PLAY_EVENT, handler );
}



ximpel.XimpelAppView.prototype.registerPauseHandler = function( handler ){
	return this.pubSub.subscribe( this.PAUSE_EVENT, handler );
}



ximpel.XimpelAppView.prototype.registerStopHandler = function( handler ){
	return this.pubSub.subscribe( this.STOP_EVENT, handler );
}



ximpel.XimpelAppView.prototype.updateControlsElementClass = function(){
	this.$controlsElement.removeClass();

	switch( this.getControlsDisplayMethod() ){
		case this.CONTROLS_DISPLAY_METHOD_OVERLAY:
			var controlsDisplayMethodClass = this.CONTROLS_DISPLAY_METHOD_OVERLAY_CLASS; break;
		case this.CONTROLS_DISPLAY_METHOD_FIXED:
			var controlsDisplayMethodClass = this.CONTROLS_DISPLAY_METHOD_FIXED_CLASS; break;
	}

	this.$controlsElement.addClass(  this.CONTROLS_CLASS + ' ' + controlsDisplayMethodClass );
}



ximpel.XimpelAppView.prototype.renderWrapper = function(){
	var wrapperDimensions = this.determineWrapperDimensions();
	this.$wrapperElement.css({
		'width': wrapperDimensions.width + "px",
		'height': wrapperDimensions.height + "px"
	});

	// We need to show the wrapper element in order to determine its dimensions.
	this.$wrapperElement.show();

	var appWidth = this.$appElement.width();
	var appHeight = this.$appElement.height();
    var contentWidth = this.$wrapperElement.width();
    var contentHeight = this.$wrapperElement.height();

    // We scale the wrapperElement element such that it fits entirely into the $appElement as largely as possible
    // but while maintining aspect ratio. (ie. either the width or height are 100% of the $appElement.)
    this.scaleToFit( this.$wrapperElement, appWidth, appHeight, contentWidth, contentHeight );
    
    // then we reposition the element such that is centered within the $appElement. So when the height is 100% it is 
    // centered horizontally and when the width is 100% its centered vertically. Note that jquery's .width and .height()
    // do not return the new scaled with of the element which we do need. So isntead we use getBoundingClientRect().
    var scaledContentWidth = this.$wrapperElement[0].getBoundingClientRect().width;
    var scaledContentHeight = this.$wrapperElement[0].getBoundingClientRect().height;
    this.repositionInCenter( this.$wrapperElement, appWidth, appHeight, scaledContentWidth, scaledContentHeight );
}



ximpel.XimpelAppView.prototype.determineControlsPosition = function(){
	var wrapperDimensions = this.determineWrapperDimensions();
	var controlsDisplayMethod = this.getControlsDisplayMethod();
	if( controlsDisplayMethod === this.CONTROLS_DISPLAY_METHOD_OVERLAY ){
		var x = 0;
		var y = (wrapperDimensions.height-this.$controlsElement.height() );
	} else if( controlsDisplayMethod === this.CONTROLS_DISPLAY_METHOD_FIXED ){
		var x = 0;
		var y = (wrapperDimensions.height-this.$controlsElement.height() );
	} else{
		var x = 0;
		var y = 0;
	}
	return {'x': x, 'y': y };
}



ximpel.XimpelAppView.prototype.determineWrapperDimensions = function(){
	var controlsDisplayMethod = this.getControlsDisplayMethod();
	var controlsEnabled = this.controlsEnabled();
	if( !controlsEnabled ){
		var width = this.$playerElement.width();
		var height = this.$playerElement.height();
	} else if( controlsDisplayMethod === this.CONTROLS_DISPLAY_METHOD_OVERLAY ){
		var width = this.$playerElement.width();
		var height = this.$playerElement.height();
	} else if( controlsDisplayMethod === this.CONTROLS_DISPLAY_METHOD_FIXED ){
		var width = this.$playerElement.width();
		var height = (this.$playerElement.height()+this.$controlsElement.height());
	}
	return {'width': width, 'height': height };
}



// implement a destroyView method which is called when the ximpelApp.destroy() method is called.
ximpel.XimpelAppView.prototype.destroyView = function(){
	//	console.log("view destroyed!");
}



ximpel.XimpelAppView.prototype.listenForWindowResize = function(){
	// Listen for window resizes and re-render the view because elements may have changed size.
	// Only start rendering if the window was stopped being resized at least 50ms ago (for performance).
	var resizeTimer;
	var namespace = 'ximpelAppViewWindowResize_'+this.model.appId;
	$(window).off('resize.'+namespace );
	$(window).on('resize.'+namespace, function() {
		clearTimeout( resizeTimer );
		resizeTimer = setTimeout( this.windowResizeHandler.bind( this ), 100);
	}.bind(this) );
}



ximpel.XimpelAppView.prototype.windowResizeHandler = function(){
	this.render();
}



ximpel.XimpelAppView.prototype.listenForKeyPresses = function(){
	var namespace = 'ximpelAppView_'+this.model.appId;
	this.$appElement.off("keypress."+namespace);
	this.$appElement.on("keypress."+namespace, function( event ){
		if( event.which === 102 ){ // the f key
			this.toggleFullscreen();
		} else if( event.which === 115 ){ // the s key (start)
			this.playHandler();
		} else if( event.which === 113 ){ // the q key (quit)
			this.stopHandler();
		} else if( event.which === 112 ){ // the p key (pause_)
			this.pauseHandler();
		}
	}.bind(this) );
}



ximpel.XimpelAppView.prototype.toggleFullscreen = function(){
	var appElement = this.$appElement[0];
	// If there is an element in fullscreen then we exit fullscreen mode.
	if( this.fullscreenElement() ){
		this.exitFullscreen();
		return;
	}

	// If fullscreen is supported then we request the appElement element to be displayed fullscreen.
	if( this.fullscreenSupported() ){
		this.requestFullscreen( appElement );
	}
}



ximpel.XimpelAppView.prototype.exitFullscreen = function(){
	if( document.exitFullscreen ){
		document.exitFullscreen();
	} else if( document.webkitExitFullscreen ){
		document.webkitExitFullscreen();
	} else if( document.mozCancelFullScreen ){
		document.mozCancelFullScreen();
	} else if( document.msExitFullscreen ){
		document.msExitFullscreen();
	} else{
		return false;
	}
	return true;
}



ximpel.XimpelAppView.prototype.fullscreenElement = function(){
	return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
}



ximpel.XimpelAppView.prototype.requestFullscreen = function( element ){
	if( element.requestFullscreen ){
		element.requestFullscreen();
	} else if( element.webkitRequestFullscreen ){
		element.webkitRequestFullscreen();
	} else if( element.mozRequestFullScreen ){
		element.mozRequestFullScreen();
	} else if( element.msRequestFullscreen ){
		element.msRequestFullscreen();
	} else{
		return false;
	}
	return true;
}



ximpel.XimpelAppView.prototype.fullscreenSupported = function(){
	return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
}



// Start listening for the fullscreenchange event and execute the fullscreenChangeHandler() function when the event is triggered.
ximpel.XimpelAppView.prototype.listenForFullscreenChange = function(){
	var namespace = 'ximpelAppViewFullscreen_'+this.model.appId;
	$(document).off('webkitfullscreenchange.'+namespace+' mozfullscreenchange.'+namespace+' fullscreenchange.'+namespace+' MSFullscreenChange.'+namespace );
	$(document).on('webkitfullscreenchange.'+namespace+' mozfullscreenchange.'+namespace+' fullscreenchange.'+namespace+' MSFullscreenChange.'+namespace, this.fullscreenChangeHandler.bind(this) );
}



// When the appElement goes into fullscreen or comes out of fullscreen we need to set the width and height of the
// $appElement because in some browsers the size of an element is not set to the size of the window when 
// going fullscreen. So we need to set this explicitly when going into fullscreen en changing it back when
// going out of fullscreen.
ximpel.XimpelAppView.prototype.fullscreenChangeHandler = function(){
	var fullscreenElement = this.fullscreenElement();
	if( fullscreenElement ){
		// There is a fullscreen element so we just went into fullscreen mode.
		this.$appElement.width( $(window).width() );
		this.$appElement.height( $(window).height() );
	} else{
		// There is no fullscreen element so we just got out of fullscreen mode. 
		// We reset the width and height of the container element to its original value.
		this.$appElement.width( this.initialAppWidth );
		this.$appElement.height( this.initialAppHeight );
	}
	this.render();
}



// Return the scale with which to resize a rectangle's x and y dimensions such that that neither x nor y exceed the specified maximum width or height while
// x and y are both as large as possible (ie. either x or y takes up the full maximum width or height).
ximpel.XimpelAppView.prototype.getScaleFactor = function( availableWidth, availableHeight, actualWidth, actualHeight ){
	var scale = Math.min( availableWidth / actualWidth, availableHeight / actualHeight );
	return scale;
}



// Return the x and y coordinates for a rectangle centered within some available space (another rectangle). If the rectangle to be centered is bigger then the 
ximpel.XimpelAppView.prototype.getCenteredRectangleCoordinates = function( availableWidth, availableHeight, actualWidth, actualHeight ){
	var x = Math.abs( Math.round( ( availableWidth-actualWidth ) / 2 ) );
	var y = Math.abs( Math.round( ( availableHeight-actualHeight ) / 2 ) );
	return { 'x': x, 'y': y };
}



ximpel.XimpelAppView.prototype.getPlayerElement = function(){
	return this.$playerElement;
}



ximpel.XimpelAppView.prototype.scaleToFit = function( $el, availWidth, availheight, contentWidth, contentHeight ){
	var scale = this.getScaleFactor( availWidth, availheight, contentWidth, contentHeight );
	$el.css({
		'-webkit-transform' : 'scale(' + scale + ',' + scale + ')',
		'-moz-transform'    : 'scale(' + scale + ',' + scale + ')',
		'-ms-transform'     : 'scale(' + scale + ',' + scale + ')',
		'-o-transform'      : 'scale(' + scale + ',' + scale + ')',
		'transform'         : 'scale(' + scale + ',' + scale + ')',
		'-webkit-transform-origin' : 'top left',
		'-moz-transform-origin'    : 'top left',
		'-ms-transform-origin'     : 'top left',
		'-o-transform-origin'      : 'top left',
		'transform-origin'         : 'top left',
	});
}



ximpel.XimpelAppView.prototype.repositionInCenter = function( $el, availWidth, availheight, contentWidth, contentHeight ){
	var coordinates = this.getCenteredRectangleCoordinates( availWidth, availheight, contentWidth, contentHeight );	
	$el.css({
		'left': coordinates.x + 'px',
		'top': coordinates.y + 'px'
	});
}



ximpel.XimpelAppView.prototype.getControlsDisplayMethod = function(){
	return this.model.configModel.controlsDisplayMethod;
}



ximpel.XimpelAppView.prototype.controlsEnabled = function(){
	return this.model.configModel.enableControls;
}



ximpel.XimpelAppView.prototype.determineAppWidth = function( specifiedWidth ){
	var $parent = this.$appElement.parent();

	if( specifiedWidth ){
		return specifiedWidth;
	} else if( this.$appElement.width() > 0 ){
		return this.$appElement.width() + "px";
	} else{
		return this.DEFAULT_APP_WIDTH;
	}
}



ximpel.XimpelAppView.prototype.determineAppHeight = function( specifiedHeight ){
	var $parent = this.$appElement.parent();
	if( specifiedHeight ){
		return specifiedHeight;
	} else if( this.$appElement.height() > 0 ){
		return this.$appElement.height() + 'px';
	} else{
		return this.DEFAULT_APP_HEIGHT;
	}
}



ximpel.XimpelAppView.prototype.determineAppElement = function( specifiedAppElement ){
	var $appElement = ximpel.getElement( specifiedAppElement );

	if( ! $appElement ){
		$appElement = this.createAppElement( specifiedAppElement );
	}
	return $appElement;
}



// Create the XIMPEL element. The element will have the ID as specified in "specifiedElementId" or the default ID if none is specified.
// If that ID is already in use by another element, then a suffix number will be added to get an ID that is not in use.
ximpel.XimpelAppView.prototype.createAppElement = function( specifiedEementId ){
	var specifiedEementId = specifiedEementId || this.DEFAULT_XIMPEL_APP_ELEMENT_ID;
	var elementId = specifiedEementId;
	var suffixCounter = 2;

	// Keep trying to generate new element id's until we found an element ID that does not yet exist.
	while( document.getElementById(elementId) ){
		elementId = specifiedEementId + "-" + suffixCounter;
		suffixCounter++;
	}
	
	// We found an elementId that doesn't exist yet, so we create a <div> with that ID.
	var $el = $("<div></div>").attr({
		'id': elementId
	});

	return $el;
}

// OverlayView()
// This object is used to create a view of an overlay (ie. to visualize the overlay by adding an element to the DOM)
// This is a child object of the View() and as such it has a new ximpel.View() object as its prototype, which allows the overlayView to use common view functionalities.

// ########################################################################################################################################################

// TODO:
// - Overlay text is messed up when it doesnt fit on one line right now. This is because we use css
//   line-height to center it vertically. 


ximpel.OverlayView = function( overlayModel, overlayElement ){
	// All view implementations should call the init method of their prototype.
	this.init( overlayModel, overlayElement );
}
// Create a new View() object and set it as the prototype for OverlayView(). This means that all instances of OverlayView will have that View() object as prototype.
ximpel.OverlayView.prototype = new ximpel.View();

// Constants
ximpel.OverlayView.prototype.SHAPE_RECTANGLE = 'rectangle';
ximpel.OverlayView.prototype.SHAPE_SQUARE = 'square';
ximpel.OverlayView.prototype.SHAPE_OVAL = 'oval';
ximpel.OverlayView.prototype.SHAPE_CIRCLE = 'circle';
ximpel.OverlayView.prototype.CSS_OVERYLAY_CLASS = 'overlay';
ximpel.OverlayView.prototype.CSS_OVERLAY_OVAL_CLASS = 'overlayOval';
ximpel.OverlayView.prototype.CSS_NO_SELECT_CLASS = 'noSelect';



// The renderView() method is mandatory to implement for any object that wants to be a view and has a View() object as prototype.
// This renderView() will be run when render() is called which is implemented in the prototype (a View() object).
// So this is called when doing: new ximpel.OverlayView(...).render();
ximpel.OverlayView.prototype.renderView = function(){
	var model = this.model;

	// Create and style the main overlay element (a <div>).
	var $el = $("<div></div>")
	.addClass(this.CSS_NO_SELECT_CLASS)
	.addClass(this.CSS_OVERYLAY_CLASS)
	.css({
		'top': model.y,
		'left': model.x
	});

	// Create a span element inside the overlay's main element which will contain the text of the overlay.
	var $span = $("<span></span>");
	if( model.text ){
		$span.text( model.text );

		// Convert '\n' to linebreaks
		$span.html( $span.html().replace(/\\n/g, '<br>') );
	}


  	// Create a div to apply the background for the overlay to. The reason we have a seperate element for the background is because
  	// in css is is only possible to change background opacity (without also changing text opacity) by using an rgba() value for the css
  	// background-color property, but that would mean we would have to convert the hex color code or the color name to rgb values (because
  	// if you use rgba you have to set the value for red, green, blue and alpha and cannot only set the alpha). Getting these rgb values
  	// for hex color codes and names is a hassle, so we decided to just create a seperate div to which the background/opacity is defined.
	var $elForBg = $('<div></div>');

	// Add the background div to $el which will become the main overlay view DOM element.
	$el.append( $elForBg );

	// Add the span to $el which will become the main overlay view DOM element.
	$el.append( $span );

	// Check which shape has been chosen and make that shape using CSS.
	switch( model.shape ){
		case this.SHAPE_RECTANGLE: 	this.makeRectangle( $el, model.width, model.height ); break;
		case this.SHAPE_SQUARE: 	this.makeSquare( $el, model.side ); break;
		case this.SHAPE_OVAL: 		this.makeOval( $el, model.width, model.height ); break;
		case this.SHAPE_CIRCLE: 	this.makeCircle( $el, model.diameter ); break;
	}
	
	// Set the styling of the overlay according to whats specified in the overlay model.
	this.setInitialOverlayStyle( $el, model );

	// Change styling when the mouse hovers over the overlay
	$el.mouseover( function(){
		this.setHoverOverlayStyle( $el, model );
	}.bind(this) ); 

	// Change styling when the mouse leaves of the overlay.
	$el.mouseout( function(){
		this.setNonHoverOverlayStyle( $el, model );
	}.bind(this) );

	// Remove the view's current DOM element.
	this.$el.remove();

	// Set $el as the view's new main DOM element.
	this.$el = $el;
}



// This method styles the overlayView's element to its initial styling that is specified in the OverlayModel
ximpel.OverlayView.prototype.setInitialOverlayStyle = function( $el, model ){
	$el.children("span").css({
		'text-align': model.textAlign
	});

	if( model.backgroundImage ){
		$el.children("div").css({
			'background-image': 'url('+model.backgroundImage+')',
			'background-size': 'cover',
			'background-repeat': 'no-repeat',
			'background-position': 'center center'
		} );
	}
	this.setNonHoverOverlayStyle( $el, model );
}



// This method sets some styling for when the overlay is not being hovered.
ximpel.OverlayView.prototype.setNonHoverOverlayStyle = function( $el, model ){
	$el.children("span").css({
		'color': model.textColor,
		'font-size': model.fontSize,
		'font-family': model.fontFamily
	} );
	$el.children("div").css({
		'opacity': model.opacity,
		'background-color': model.backgroundColor
	});
}



// This method sets some styling for when the overlay is being hovered.
ximpel.OverlayView.prototype.setHoverOverlayStyle = function( $el, model ){
	$el.children("span").css({
		'color': model.hoverTextColor || model.textColor,
		'font-size': model.hoverFontSize || model.fontSize,
		'font-family': model.hoverFontFamily || model.fontFamily
	});
	$el.children("div").css({
		'opacity': model.hoverOpacity,
		'background-color': model.hoverBackgroundColor || model.backgroundColor
	});
}



// implement a destroyView method which is called when the overlayView.destroy() method is called.
ximpel.OverlayView.prototype.destroyView = function(){
	//	console.log("view destroyed!");
}



// If the specified shape was a rectangle, then this function will apply styles to the given element to make it a rectangle.
ximpel.OverlayView.prototype.makeRectangle = function( el, width, height ){
	width = this.ensureUnit(width,'px');
	height = this.ensureUnit(height,'px');
	el.css({
		'width': width,
		'height': height,
	});
	return this;
}



// If the specified shape was a square, then this function will apply styles to the given element to make it a square.
ximpel.OverlayView.prototype.makeSquare = function( el, side ){
	this.makeRectangle( el, side, side );
}



// If the specified shape was an oval, then this function will apply styles to the given element to make it an oval.
ximpel.OverlayView.prototype.makeOval = function( el, width, height ){
	width = this.ensureUnit(width,'px');
	height = this.ensureUnit(height,'px');
	el.addClass(this.CSS_OVERLAY_OVAL_CLASS);
	el.css({
		'width': width,
		'height': height,
		'border-radius': '50%'
	});
	return this;
}

// If the specified shape was a circle, then this function will apply styles to the given element to make it a circle.
ximpel.OverlayView.prototype.makeCircle = function( el, diameter ){
	this.makeOval( el, diameter, diameter );
	return this;
}



// This function takes a value and checks if the value is numeric, if it is then no units have been specified.
// We then add the specified units to the value or if no unit to use was specified then we just add "px" to the value.
// ie. if value is '6' and unit is 'px' then the return value will be '6px'
ximpel.OverlayView.prototype.ensureUnit = function( value, unit ){
	// If the last character of value is numeric, then it doesn't have units specified so we add the specified unit or 'px' if none was specified.
	var unit = unit || 'px';

	if( this.isNumeric( value.toString().slice(-1) ) ){
		return value+unit;
	} else{
		return value; // the value doens't end with a number so it already has a unit specified.
	}
}



// Check if a value is numeric or not.
ximpel.OverlayView.prototype.isNumeric = function( num ){
    return (num > 0 || num === 0 || num === '0' || num < 0) && num !== true && isFinite(num);
}
// QuestionView()
// The QuestionView object just displays a question based on a question model.
// This object is used to create a view of a question (ie. to visualize the question by adding an element to the DOM)
// This is a child object of the View() and as such it has a new ximpel.View() object as its prototype, which allows
// the overlayView to use common view functionalities.

//
ximpel.QuestionView = function( questionModel, questionElement ){
	// All view implementations should call the init method of their prototype.
	this.init( questionModel, questionElement );

	// The font size of the Question text.
	this.questionFontSize = "40px";
	
	// This wills store the index of the question that will play next.
	this.nextQuestionIndex = 0;

	// The container html element in which the options of the question will be shown
	this.$optionsContainer = null;

	// Indicates if the question is answered.
	this.isAnswered = false;

	// When a question is answered a timeout is set, this is the handler for the timeout.
	this.timeoutHandlerQuestionAnsweredPause = null;
}

// Create a new View() object and set it as the prototype for QuestionView(). 
// This means that all instances of QuestionView will have that View() object as prototype.
ximpel.QuestionView.prototype = new ximpel.View();
ximpel.QuestionView.prototype.EVENT_QUESTION_ANSWERED = 'answered';
ximpel.QuestionView.prototype.EVENT_QUESTION_ENDED = 'ended';
ximpel.QuestionView.prototype.CSS_QUESTION_CLASS = 'question';
ximpel.QuestionView.prototype.CSS_QUESTION_TEXT_CLASS = 'questionText';
ximpel.QuestionView.prototype.CSS_QUESTION_OPTION_CLASS = 'questionOption';
ximpel.QuestionView.prototype.CSS_NO_SELECT_CLASS = 'noSelect';


// The renderView() method is mandatory to implement for any object that wants to be a view and has a View() object as prototype.
// This renderView() will be run when render() is called which is implemented in the prototype (a View() object).
// So this is called when doing: new ximpel.QuestionView(...).render();
ximpel.QuestionView.prototype.renderView = function(){
	var model = this.model;

	// The main element that functions as a wrapper.
	var $question = this.$question = $("<div></div>")
	.addClass(this.CSS_QUESTION_CLASS)
	.addClass(this.CSS_NO_SELECT_CLASS)
	.css({
		'text-align': 'center',
		'width': '100%',
		'min-height': '100px',
		'top': '15%',
		'left': '0px',
		'font-size': this.questionFontSize,
		'padding': '0px 0px 0px 0px'
	});

	// The element for the question itself.
	var $questionTextContainer = $("<div></div>")
	.addClass( this.CSS_QUESTION_TEXT_CLASS )
	.css({
		'background-color': 'rgba( 0, 0, 0, 0.8 )',
		'color': 'white',
		'float': 'left',
		'width': '70%',
		'padding': '10px 0px 10px 0px',
		'margin': '0px 15% 0px 15%'
	}).html( model.questionText );

	// The container element for the options.
	var $optionsContainer = $("<div></div>")
	.css({
		'float': 'left',
		'width': '70%',
		'padding': '0px 15% 0px 15%',
	});

	// Add the options to the container element.
	for( var i=0; i<model.options.length; i++ ){
		var optionModel = model.options[i];
		var $option = $('<span></span>').css({
			'background-color': 'rgba( 255, 255, 255, 0.7 )',
			'color': 'black',
			'display': 'block',
			'cursor': 'pointer',
			'width': '100%',
			'padding': '10px 0px 10px 0px'
		}).mouseover( function() {
    		$(this).css("background-color","rgba( 255, 255, 255, 0.9 )");
		}).mouseout( function() {
    		$(this).css("background-color","rgba( 255, 255, 255, 0.7 )");
		}).addClass( this.CSS_QUESTION_OPTION_CLASS );

		// Define what happens when the option is clicked.
		$option.one('click', function( $optionsContainer, $option, chosenOption ){
			this.questionAnswerHandler( $optionsContainer, $option, chosenOption );
		}.bind(this, $optionsContainer, $option, optionModel.optionName ) )

		var text = optionModel.optionText;
		var $optionText = $( document.createTextNode( text ) );
		$option.append( $optionText );
		$optionsContainer.append( $option );
	}

	// Add the question text and the options to the question wrapper element.
	$question.append( $questionTextContainer );
	$question.append( $optionsContainer );
	this.$optionsContainer = $optionsContainer;

	// Remove the view's current DOM element.
	this.$el.remove();

	// Set $el as the view's new main DOM element.
	this.$el = $question;
}



// The method that will be called when the question is answered.
ximpel.QuestionView.prototype.questionAnswerHandler = function( $optionsContainer, $option, chosenOption ){
	this.isAnswered = true;

	// find all the <option> elements.
	var $options = $optionsContainer.find('.'+this.CSS_QUESTION_OPTION_CLASS);

	// Turn off the hover effect of the options now that the answere is given.
	$options.off('mouseover mouseout click');

	// Depending on the corectness of the answer change the background color of the chosen option
	if( this.model.answer === chosenOption ){
		$option.css('background-color', 'rgba(0, 255, 0, 0.7)');		
	} else{
		$option.css('background-color', 'rgba(255, 0, 0, 0.7)');
	}

	// After one second hide the question using an animation. When the animation finishes, publish an event
	// that indicated the question has ended.
	this.timeoutHandlerQuestionAnsweredPause = setTimeout( function(){
		this.$el.fadeOut( 400, function(){
			this.pubSub.publish( this.EVENT_QUESTION_ENDED, chosenOption );
		}.bind(this) );
	}.bind(this), 1000 );

	// publish an event that the question has been answered.
	this.pubSub.publish( this.EVENT_QUESTION_ANSWERED, chosenOption );
}



// Hide the question using an animation. This method is used by the QuestionManager
// if the user did not give an answer in time.
ximpel.QuestionView.prototype.hideQuestion = function(){
	var $options = this.$optionsContainer.find('.'+this.CSS_QUESTION_OPTION_CLASS);
	$options.off('mouseover mouseout click');
	this.$el.fadeOut( 400, function(){
		this.pubSub.publish( this.EVENT_QUESTION_ENDED );
	}.bind(this) );
}



// Add an event handler to this QuestionView. This is done by the QuestionManager
// to find out when a question has been answered/ended.
ximpel.QuestionView.prototype.addEventHandler = function( eventName, callback ){
	switch( eventName ){
		case this.EVENT_QUESTION_ENDED:
			return this.pubSub.subscribe( this.EVENT_QUESTION_ENDED, callback );
		case this.EVENT_QUESTION_ANSWERED:
			return this.pubSub.subscribe( this.EVENT_QUESTION_ANSWERED, callback );
		default:
			ximpel.warn("QuestionView.addEventHandler(): event type '" + eventName + "' is not supported.");    
			return null;
	}
}



// Remove an event handler.
ximpel.QuestionView.prototype.removeEventHandler = function( eventName, callback ){
	switch( eventName ){
		case 'end':
			this.pubSub.unsubscribe( this.EVENT_QUESTION_ENDED, callback ); 
			return 	true;
		default: 
			ximpel.warn("QuestionView.removeEventHandler(): event type '" + eventName + "' is not supported. Can't add/remove event handlers of this type.");
			return false;
	}
}


// implement a destroyView method which is called when the destroy() method is called.
ximpel.QuestionView.prototype.destroyView = function(){
	// Remove a jquery animation that may be in progress.
	this.$el.stop( true ); // any callbacks for the animation complete will not be called.
	clearTimeout( this.timeoutHandlerQuestionAnsweredPause );
}
// Video
// The Video object implements a media type for XIMPEL to use. This media type is one of the core media types that ship with
// XIMPEL by default. MediaTypes are a sort of plugins. Anyone can create their own media type. None of the media types
// (not even the core media types) have a special integration with XIMPEL. There are just a number of requirements that should
// be fulfilled to create a MediaType (See the documentation for more info). 
//
// Notes:
// - The Video object definition is added to the: ximpel.mediaTypeDefinitions namespace, but this is not required, it
//   could be stored in any variable.
// - The MediaType gets a new instance of ximpel.MediaType() as prototype. This gives the media type a number of predefined 
//   methods. For instance this implements a play(), pause() and stop() method which XIMPEL will call. These methods in turn
//   will call the mediaPlay(), mediaPause() and mediaStop() methods that we implement in this Video object.
// - Besides the implementation of some required methods of a media type, the media type must be registered. This is
//   done at the bottom using the ximpel.registerMediaType() function.
//
// ##################################################################################################
// ##################################################################################################
// ##################################################################################################

// TODO:
// - Check for loading failures and handle them properly (for example: maybe add an event to the MediaType() prototype
//   object which this Video object can throw so that XIMPEL can listen for the event and act upon the error).


// The constructor function which XIMPEL will use to create instances of our media type. Four arguments
// should be passed to the constructor function:
// - customElements - contains the child elements that were within the <video> tag in the playlist.
// - customAttributes - contains the attributes that were on the <video> tag in the playlist.
// - $parentElement - The element to which the video will be appended (the ximpel player element).
// - player - A reference to the player object, so that the media type can use functions from the player.
ximpel.mediaTypeDefinitions.Video = function( customElements, customAttributes, $parentElement, player ){
	// The custom elements that were added inside the <video> tag in the playlist (<source> for example).
	this.customElements = customElements;

	// The custom attributes that were added to the <video> tag in the playlist.
	this.customAttributes = customAttributes;

	// The XIMPEL player element to which this video can attach itself (this is the element to which all media DOM nodes will be attached).
	this.$attachTo = $parentElement;

	// A reference to the XIMPEL player object. The media type can make use of functions on the player object.
	this.player = player;

	// Set mute audio
	this.mute = this.customAttributes.mute === 'true' || false;

	// The x coordinate of the video relative to the ximpel player element or 'center' to align center.
	// The value for x should include the units (for instance: 600px or 20%)
	this.x = this.customAttributes.x || 'center';

	// The y coordinate of the video relative to the ximpel player element or 'center' to align center.
	// The value for y should include the units (for instance: 600px or 20%)
	this.y = this.customAttributes.y || 'center';

	// The width of the video element. The value includes units (for instance: 600px or 20%)
	this.width = this.customAttributes.width;

	// The height of the video element. The value includes units (for instance: 600px or 20%)
	this.height = this.customAttributes.height;

	// The point in the video from which the video should start playing (if not specified in the playlist then it is set to 0.)
	// The statTime should be in seconds but can be a floating point number.
	this.startTime = customAttributes['startTime'] || 0;

	// jQuery selectors that point to the video container div, the video element itself and
	// a progressbar. We will create the following DOM structure:
	//   <div class="ximpelVideoContainer">
	//     <video />
	//     <div class="ximpelProgressBar">
	//       <div />
	//    </div>
	//   </div>
	this.$videoContainer = null;
	this.$video = null;
	this.$progressBar = null;

	// Get the <source> element that was specified in the playlist for this video (should be one element)
	var playlistSourceElement = ximpel.filterArrayOfObjects( customElements, 'elementName', 'source' )[0];

	// Show progress bar if the <video ... progressbar="true" />
	this.showProgressBar = (customAttributes.progressbar == 'true');

	// Get a jquery object that selects all the html source elements that should be added to the video element.
	this.$htmlSourceElements = this.getHtmlSourceElements( playlistSourceElement );

	// The buffering promise will hold a jQuery promise that resolves when the buffering is finished.
	// The state of the jquery promise can be checked to find out if the buffering has finished.
	this.bufferingPromise = null;

	// State of the media item.
	this.state = this.STATE_STOPPED;
}

ximpel.mediaTypeDefinitions.Video.prototype = new ximpel.MediaType();
ximpel.mediaTypeDefinitions.Video.prototype.STATE_PLAYING = 'state_video_playing';
ximpel.mediaTypeDefinitions.Video.prototype.STATE_PAUSED = 'state_video_paused';
ximpel.mediaTypeDefinitions.Video.prototype.STATE_STOPPED = 'state_video_stopped';



// This method is called every time the 'timeupdate' event fires, which is whenever the
// `currentTime` attribute of the video has been updated. If the video has a progress bar
// (defined in the playlist), we will update it.
ximpel.mediaTypeDefinitions.Video.prototype.timeupdate = function(evt) {
	var progress = evt.currentTarget.currentTime / evt.currentTarget.duration * 100;
	if (this.$progressBar) {
		this.$progressBar.css({width: progress + '%'});
	}
};



// The mediaPlay() is one of the required methods for a media type. XIMPEL calls the play() method on the
// prototype which in turn calls this mediaPlay() method.
ximpel.mediaTypeDefinitions.Video.prototype.mediaPlay = function(){
	// Ignore this call if this media item is already playing or resume playback if its paused.
	if( this.state === this.STATE_PLAYING ){
		return;
	} else if( this.state === this.STATE_PAUSED ){
		this.resumePlayback();
		return;
	}

	// Indicate that the media item is in a playing state now.
	this.state = this.STATE_PLAYING;

	// Create the video element but don't attach it to the DOM yet and don't start loading untill we call .load()
	var $video = this.$video = $('<video />', {
		'preload': 'none'
	});
	var videoElement = $video[0];
	var $videoContainer = this.$videoContainer = $('<div class="ximpelVideoContainer" />').append($video);

	// Add the HTML source elements to the video element (the browser will pick which source to use once the video starts loading).
	$video.append( this.$htmlSourceElements );

	// Every media type which has an ending should call the .ended() method when the media has ended. 
	// ended() is a method on the prototype. By calling the ended() method, all handler functions registered
	// with .addEventHandler('end', handlerFunc) will be called. Here we indicate that the .ended() method will be
	// called when the 'ended' event on the video element is triggered (ie. when the video has nothing more to play).
	$video.on('ended', this.ended.bind(this) );

	// Call 'timeupdate' method on the 'timeupdate' event
	$video.on('timeupdate', this.timeupdate.bind(this) );

	// Call 'timeupdate' method on the `timeupdate` event
	$video.on( 'timeupdate', this.timeupdate.bind(this) );

	// Set an event listener (that runs only once) for the loadedmetadata event. This waits till the metadata of the video
	// (duration, videoWidth, videoHeight) has been loaded and then executes the function.
	$video.one("loadedmetadata", function(){
		// This function is executed once the metadata of the video has been loaded...

		// Set the current position in the video to the appropriate startTime (this can only be done after the metadata is loaded).
		videoElement.currentTime = this.startTime;

		// Attach the progress bar to the video container
		if (this.showProgressBar) {
			var $progressBar = this.$progressBar = $('<div />');
			$('<div class="ximpelProgressBar" />').append($progressBar).appendTo(this.$videoContainer);
		}

		// Attach the video container to the DOM.
		this.$videoContainer.appendTo( this.$attachTo );

		// This sets the x, y, width and height of the video (can only be done after the video is appended to the DOM)
		this.calculateVideoDetails();
	}.bind(this) );

	// Next we create a jquery deferred object (promise) and we give it a function that runs when the deferred
	// object is resolved. The deferred will be resolved as soon as the canplaythrough event is thrown by the video element.
	var bufferingDeferred = new $.Deferred();
	bufferingDeferred.done( function(){
		// this functions runs when the deferred is resolved (ie. the initial buffering is finished)...
		// When the buffering is done and the media item is still in a playing state then play the 
		// media item, otherwise do nothing. It may be the case that the media item is in a non-playing
		// state when the pause() method has been called during the buffering.
		if( this.state === this.STATE_PLAYING ){
			$video.prop('muted', this.mute);
			videoElement.play();
		}
	}.bind(this) );


	// Set an event listener for the canplaythough event. This waits until enough of the video has been loaded 
	// to play without stuttering (as estimated by the browser). Note that the canplaythrough event has some browser 
	// differences. Some browsers call it multiple times and others call it only once. It is also not clear whether
	// canplaythrough means the video has enough data to play from the beginning or has enough data to play from 
	// the video's current playback time. This means that the video may not be preloaded properly even when the 
	// canplaythrough event is thrown. However, every major browser calls it once at least, so we just listen
	// for the event and can only hope that enough of the video has been buffered to start playing smoothly.
	$video.one("canplaythrough", function(){
		// The video is preloaded. We resolve the bufferingDeferred object so that the registered callbacks are 
		// called (the callbacks registered with bufferingDeferred.done() bufferingDeferred.fail() etc)
		bufferingDeferred.resolve();
	}.bind(this) );

	// Attach a handler function for when the video fails to load.
	$video.error( function(e){
		ximpel.warn("Video.mediaPlay(): failed to buffer the video: '" + videoElement.src + "'.");
		bufferingDeferred.reject();
	}.bind(this) );

	// start loading the video now.
	videoElement.load();
	
	this.bufferingPromise = bufferingDeferred.promise();
	return this.bufferingPromise;
}



// The resumePlayback() method resumes playback from a paused state.
ximpel.mediaTypeDefinitions.Video.prototype.resumePlayback = function(){
	// Indicate that the media item is in a playing state now.
	this.state = this.STATE_PLAYING;
	if( this.bufferingPromise.state() === "resolved" ){
		this.$video[0].play();
	}
}



// The mediaPause() is one of the required methods for a media type. XIMPEL calls the pause() method on the
// prototype which in turn calls this mediaPause() method.
ximpel.mediaTypeDefinitions.Video.prototype.mediaPause = function(){
	// Ignore this pause request if the video is not in a playing state.
	if( this.state !== this.STATE_PLAYING ){
		return;
	}
	this.state = this.STATE_PAUSED;

	// Pause the video element.
	this.$video[0].pause();
}



// The mediaStop() is one of the required methods for a media type. XIMPEL calls the stop() method on the
// prototype which in turn calls this mediaStop() method. This method stops the video entirely without being 
// able to resume later on. After this method the video playback pointer has been reset to its start position
// and the video element is removed such that the browser will not proceed loading the video and nothing is
// visible anymore.
ximpel.mediaTypeDefinitions.Video.prototype.mediaStop = function(){
	// Ignore this stop request if the video is already in a stopped state.
	if( this.state === this.STATE_STOPPED ){
		return;
	}
	// Indicate that the media item is now in a stopped state.
	this.state = this.STATE_STOPPED;

	var videoElement = this.$video[0];
	videoElement.pause();
	
	// We need to tell the video to stop loading. We do this by setting the src of the video element to "" and
	// then tell it to start loading that. Because "" is not a valid src browsers will stop loading the video
	// element entirely.
	videoElement.src = "";
	videoElement.load();

	// We detach and remove the video element. We just create it again when the play method is called.
	this.$videoContainer.detach();
	this.$videoContainer.remove();

	// Make sure we are back in the state the media item was in before it started playing.
	this.$videoContainer = null;
	this.$video = null;
	this.$progressBar = null;
	this.bufferingPromise = null;
}



// Returns whether the video is playing.
ximpel.mediaTypeDefinitions.Video.prototype.mediaIsPlaying = function(){
	return this.state === this.STATE_PLAYING;
}



// Returns whether the video is paused.
ximpel.mediaTypeDefinitions.Video.prototype.mediaIsPaused = function(){
	return this.state === this.STATE_PAUSED;
}



// Returns whether the video is stopped.
ximpel.mediaTypeDefinitions.Video.prototype.mediaIsStopped = function(){
	return this.state === this.STATE_STOPPED;
}



// This method determines and sets the x, y, width and height of the video element relative to the player element
// to which the video will be attached. If no x, y , width and height were specified for the media item then it
// will be displayed as large as possible, centered, and while maintaining aspect ratio within the player element.
ximpel.mediaTypeDefinitions.Video.prototype.calculateVideoDetails = function(){
	// Get the width and height of the player element.
	var playerElementWidth = this.$attachTo.width();
	var playerElementHeight = this.$attachTo.height();

	// if x and or y is "center" then we will determine the x and y coordinates when we append the video element to the DOM.
	// We do it later because we can only reliably determine the x/y coordinate when the video element is loaded and appended to the DOM.
	var x = this.x === 'center' ? '0px' : this.x; 
	var y = this.y === 'center' ? '0px' : this.y;

	// By now the video has been appened to the DOM. This means that we can now retrieve the intrinsic width and height 
	// of the video element. Then we need to determine the css values for width and height...
	if( !this.width && !this.height ){
		// Both width and height have not been specified. In that case we want the video
		// to be displayed as large as possible while maintaining aspect ratio of the video.
		var intrinsicVideoWidth = this.$video[0].videoWidth;
		var intrinsicVideoHeight = this.$video[0].videoHeight;
		var videoAspectRatio = intrinsicVideoWidth / intrinsicVideoHeight;
		var playerElementAspectRatio = playerElementWidth / playerElementHeight;

		if( videoAspectRatio >= playerElementAspectRatio ){
			var width = '100%';
			var height = 'auto';
		} else{
			var width = 'auto';
			var height = '100%';
		}
	} else if( !this.width ){
		// A height was specifie but no width, in this case we set the height and let the width be determined automatically.
		var width = 'auto';
		var height = this.height;
	} else if( !this.height ){
		// A width was specifie but no height, in this case we set the width and let the height be determined automatically.
		var width = this.width;
		var height = 'auto'
	} else{
		// Both were specified, so we just use that.
		var width = this.width;
		var height = this.height;
	}

	// Set the x, y, width and height for the element.
	// We need to do this before we check if x and y are equal to "center"
	// because determining the x and y to center the video can only be done if the width and height of the
	// video are known and this information is only accessible if we set it here.
	this.$videoContainer.css({
		'position': 'absolute',
		'width': width,
		'height': height,
		'left': x,
		'top': y
	});

	// If x or y are set to 'center' then we use the width and height of the video element to determine the x and y coordinates such
	// that the video element is centered within the player element.
	if( this.x === 'center' ){
		var x = Math.round( Math.abs( this.$attachTo.width() - this.$video.width() ) / 2 );
	}
	if( this.y === 'center' ){
		var y = Math.round( Math.abs( this.$attachTo.height() - this.$video.height() ) / 2 );
	}
	this.$videoContainer.css({
		'left': x,
		'top': y
	});
}



// Every media item can implement a getPlayTime() method. If the media type implements this method then 
// ximpel will use this method to determine how long the media item has been playing. If this method is 
// not implemented then ximpel itself will calculate how long a media item has been playing. Note that
// the media item can sometimes better determine the play time. For instance, if the network has problems
// causing the video to stop loading, then ximpel would not be able to detect this and use an incorrect 
// play time. A video media item could still determine the correct play time by looking at the current 
// playback time of the video element (something that the core of ximpel has no access to). This is exactly 
// what the getPlayTime method of this video media item does. It returns the play time in miliseconds.
ximpel.mediaTypeDefinitions.Video.prototype.getPlayTime = function(){
	var videoElement = this.$video[0];
	if( !videoElement.currentTime || videoElement.currentTime == 0 ){
		return 0;
	} else{
		// return the play time in miliseconds.
		return (videoElement.currentTime - this.startTime) * 1000;
	}
}



// In the ximpel playlist there is one source element for each <video>. Within this source element multiple sources can 
// be specified by using the extensions and types attribute to specify multiple source files. This method takes the 
// custom source element specified in the playlist and returns a jquery object containing one or more HTML5 source 
// elements. The returned set of HTML5 source elements can be appended to the html5 <video> element such that the 
// browser can choose wich source it uses.
ximpel.mediaTypeDefinitions.Video.prototype.getHtmlSourceElements = function( playlistSourceElement ){
	// The source element in the playlist looks like this: 
	// <source file="somefilename" extensions="mp4, webm" types="video/mp4, video/webm" />
	// The attributes "file", "extensions" and "types" are accesible via: playlistSourceElement.elementAttributes.<attributename>

	// The name/path of the file (without the file extension)
	var filename = playlistSourceElement.elementAttributes.file;
	
	// The extensions attribute contains a comma seperated list of available file extensions. If the extension attribute
	// has the value: "mp4, webm", then it means that there is a <filePath>.mp4 and a <filePath>.webm availabe.
	var extensions = playlistSourceElement.elementAttributes.extensions || "";
	extensions = extensions.replace(/\s/g, ""); // remove white space characters
	extensionsArray = extensions.split(","); 	// split the comma seperated extensions into an array.

	// The types attribute contains a comma seperated list of mime types. The first mime type corresponds to the first extension
	// listed in the extensions attribute, the second mime type to the second extension and so on. 
	var types = playlistSourceElement.elementAttributes.types || "";
	types = types.replace(/\s/g, "");
	typesArray = types !== "" ? types.split(",") : [];

	// For each of the listed extensions we create a <source> element with a corresponding src attribute and type attribute.
	var $sources = $([]);
	for( var i=0; i<extensionsArray.length; i++ ){
		var type = typesArray[i] || "";
		var src = filename+"."+extensionsArray[i];

		// Check if a media directory was specified in the XIMPEL config, if so the src is made to be relative to this mediaDirectory
		var mediaDirectory = this.player.getConfigProperty("mediaDirectory") || "";
		if( mediaDirectory != "" ){
			src = mediaDirectory + "/" + src; 
		}

		// Create the actual <source> element with a src and type attribute.
		var $source = $('<source />').attr({
			'src': src,
			'type': type
		});

		// Add the created source to a jquery selected that will select all source elements.
		$sources = $sources.add( $source );
	}

	// return a jquery object containing the source elements.
	return $sources;
}



// Finally we register the media type to XIMPEL such that XIMPEL knows some information about the media type.
// Information for the parser (tagname, allowedAttributes, requiredAttributes, allowedElements and requiredElements)
// and information for the XIMPEL player (the constructor such that it can create instances of the media type)
var mediaTypeRegistrationObject = new ximpel.MediaTypeRegistration( 
	'video',  							// = the media type ID (and also the tagname used in the playlist)
	ximpel.mediaTypeDefinitions.Video,  // a pointer to the constructor function to create instances of the media type.
	{
		'allowedAttributes': ['mute', 'width', 'height', 'x', 'y', 'startTime'], // the attributes that are allowed on the <video> tag (excluding the attributes that are available for every media type like duration).
		'requiredAttributes': [],		// the attributes that are required on the <video> tag.
		'allowedChildren': ['source'],	// the child elements that are allowed on the <video> tag.
		'requiredChildren': ['source'] 	// The child elements that are required on the <video> tag.
	}
);

ximpel.registerMediaType( mediaTypeRegistrationObject );

ximpel.mediaTypeDefinitions.Iframe = function( customEl, customAttr, $el, player ){
   
    this.customElements = customEl;
    this.customAttributes = customAttr;
    this.$parentElement = $el;
    this.player = player;
    
    var iFrameUrl = this.customAttributes.url;
    var iFrameBackgroundColor = this.customAttributes.backgroundColor;
    if(iFrameBackgroundColor == null) {
    	iFrameBackgroundColor = "#000000";
    }
    var containerBackgroundColor = this.customAttributes.containerBackgroundColor;
    if(containerBackgroundColor == null) {
    	containerBackgroundColor = "#000000";
    }
    var iFrameX = this.customAttributes.x;
    if(iFrameX == null) {
    	iFrameX = 0;
    }
    var iFrameY = this.customAttributes.y;
    if(iFrameY == null) {
    	iFrameY = 0;
    }
    var iFrameWidth = this.customAttributes.width;
    if(iFrameWidth == null) {
    	iFrameWidth = 1920;
    }
    var iFrameHeight = this.customAttributes.height;
    if(iFrameHeight == null) {
    	iFrameHeight = 1080;
    }
  
	//use of 'container' property to allow for overlays
	//for now: use margin-left and margin-top to utilize specified x and y values
    this.$iframeSpan = $('<div style="background-color:'+ containerBackgroundColor +'" class="container"></div>');
    
    this.$iframeSpan.html( $('<iframe width="' + iFrameWidth + '" height="' + iFrameHeight + '" style="margin-left:'+iFrameX+'; margin-top:'+iFrameY+'; border:0px solid white; top: 500px; background-color:'+ iFrameBackgroundColor +'" wmode="Opaque" src="' + iFrameUrl + '"></iframe>') );
    
    /*this.$iframeSpan.css({
        'color': 'red',
        'font-size': '100px'
    });*/
  
    this.state = 'stopped';
}
ximpel.mediaTypeDefinitions.Iframe.prototype = new ximpel.MediaType();
  
ximpel.mediaTypeDefinitions.Iframe.prototype.mediaPlay = function(){
    this.state = 'playing';
    this.$parentElement.append( this.$iframeSpan );
    this.player.pubSub.publish( this.player.EVENT_IFRAME_OPEN, {
        $iframe: this.$iframeSpan.find('iframe'),
        url: this.customAttributes.url,
    });
}
  
ximpel.mediaTypeDefinitions.Iframe.prototype.mediaPause = function(){
    this.state = 'paused';
}
  
ximpel.mediaTypeDefinitions.Iframe.prototype.mediaStop = function(){
    this.state = 'stopped';
    this.player.pubSub.publish( this.player.EVENT_IFRAME_CLOSE, {
        $iframe: this.$iframeSpan.find('iframe'),
        url: this.customAttributes.url,
    });
    this.$iframeSpan.detach();
}
  
ximpel.mediaTypeDefinitions.Iframe.prototype.mediaIsPlaying = function(){
    return this.state === 'playing';
}
  
ximpel.mediaTypeDefinitions.Iframe.prototype.mediaIsPaused = function(){
    return this.state === 'paused';
}
  
ximpel.mediaTypeDefinitions.Iframe.prototype.mediaIsStopped = function(){
    return this.state === 'stopped';
}
 
// Register the media type with XIMPEL
var r = new ximpel.MediaTypeRegistration('iframe', ximpel.mediaTypeDefinitions.Iframe, {
        'allowedAttributes': ['url','width','height','backgroundColor','containerBackgroundColor','x','y'],
        'requiredAttributes': ['url'],
        'allowedChildren': [],
        'requiredChildren': [],
} );
ximpel.registerMediaType( r );
// Image
// The Image object implements a media type for XIMPEL to use. This media type is one of the core media types that ship with
// XIMPEL by default. MediaTypes are a sort of plugins. Anyone can create their own media type. None of the media types
// (not even the core media types) have a special integration with XIMPEL. There are just a number of requirements that should
// be fulfilled to create a MediaType (See the documentation for more info). 
//
// Notes:
// - The Image object definition is added to the: ximpel.mediaTypeDefinitions namespace, but this is not required, it
//   could be stored in any variable.
// - The MediaType gets a new instance of ximpel.MediaType() as prototype. This gives the media type a number of predefined 
//   methods. For instance this implements a play(), pause() and stop() method which XIMPEL will call. These methods in turn
//   will call the mediaPlay(), mediaPause() and mediaStop() methods that we implement in this Image object.
// - Besides the implementation of some required methods of a media type, the media type must be registered. This is
//   done at the bottom using the ximpel.registerMediaType() function.
//
// ##################################################################################################
// ##################################################################################################
// ##################################################################################################

// TODO:
// - Check for loading failures and handle them properly (for example: maybe add an event to the MediaType() prototype
//   object which this Image object can throw so that XIMPEL can listen for the event and act upon the error).



// The constructor function which XIMPEL will use to create instances of our media type. Four arguments
// should be passed to the constructor function:
// - customElements - contains the child elements that were within the <image> tag in the playlist.
// - customAttributes - contains the attributes that were on the <image> tag in the playlist.
// - $parentElement - The element to which the image will be appended (the ximpel player element).
// - player - A reference to the player object, so that the media type can use functions from the player.
ximpel.mediaTypeDefinitions.Image = function( customElements, customAttributes, $parentElement, player ){
	// The custom elements that were added inside the <image> tag in the playlist.
	this.customElements = customElements;

	// The custom attributes that were added to the <image> tag in the playlist.
	this.customAttributes = customAttributes;

	// The XIMPEL player element to which this image can attach itself (this is the element to which all media DOM nodes will be attached).
	this.$attachTo = $parentElement;

	// A reference to the XIMPEL player object. The media type can make use of functions on the player object.
	this.player = player;

	// The x coordinate of the image relative to the ximpel player element or 'center' to align center.
	// The value for x should include the units (for instance: 600px or 20%)
	this.x = this.customAttributes.x || 'center';

	// The y coordinate of the image relative to the ximpel player element or 'center' to align center.
	// The value for y should include the units (for instance: 600px or 20%)
	this.y = this.customAttributes.y || 'center';

	// The width of the image element. A default is used when not specified.
	// The value for width should include the units (for instance: 600px or 20%)
	this.width = this.customAttributes.width;

	// The height of the image element. A default is used when not specified.
	// The value for height should include the units (for instance: 600px or 20%)
	this.height = this.customAttributes.height;

	// Check if a media directory was specified in the XIMPEL config, if so the src is made to be relative to this mediaDirectory
	var mediaDirectory = player.getConfigProperty("mediaDirectory") || "";
	this.imageSource = customAttributes['src'] || '';
	if( mediaDirectory != "" ){
		this.imageSource = mediaDirectory + "/" + this.imageSource;
	}

	// will hold the image's HTML element (or more specifically a jquery selector that points to the HTML element).
	this.$image = null;
	
	// This will hold a jquery promise object when the media item is loading or has been loaded already. 
	// This is used to check if the item has been loaded or is loaded.
	this.loadPromise = null;

	// State of the media item.
	this.state = this.STATE_STOPPED;
}
ximpel.mediaTypeDefinitions.Image.prototype = new ximpel.MediaType();
ximpel.mediaTypeDefinitions.Image.prototype.STATE_PLAYING = 'state_image_playing';
ximpel.mediaTypeDefinitions.Image.prototype.STATE_PAUSED = 'state_image_paused';
ximpel.mediaTypeDefinitions.Image.prototype.STATE_STOPPED = 'state_image_stopped';



// The mediaPlay() is one of the required methods for a media type. XIMPEL calls the play() method on the
// prototype which in turn calls this mediaPlay() method.
ximpel.mediaTypeDefinitions.Image.prototype.mediaPlay = function(){
	// Ignore this call if this media item is already playing.
	if( this.state === this.STATE_PLAYING ){
		return;
	} else if( this.state === this.STATE_PAUSED ){
		this.resumePlayback();
		return;
	}

	// Indicate that the media item is in a playing state now.
	this.state = this.STATE_PLAYING;

	// Create the image object, but we don't set a source so we don't start loading yet.
	// First we will attach some event listeners.
	this.$image = $('<img />');

	// Next we create a jquery deferred object (promise) and we give it a function that runs when the deferred
	// object is resolved. The deferred will be resolved as soon as the image has been loaded.
	var deferred = new $.Deferred();


	// Listen for the load event on the image tag and execute the function when loading completes.
	this.$image.on('load', function(){
		// The loading completed, we will resolve the deferred so registered callbacks on the deferred object will be called.
		// These are callbacks registered with something like: deferred.done( func ).
		deferred.resolve();

		// Attach the image element to the DOM.
		this.$image.appendTo( this.$attachTo );

		// This sets the x, y, width and height of the image (can only be done after the image is appended to the DOM)
		this. calculateImageDetails();
	}.bind(this) );


	// Listen for the error event of the iamge.
	this.$image.on('error', function(){
		// The image failed loading so we reject the deferred so that registered callbacks on the deferred object will be called.
		// These are callbacks registered with something like: deferred.fail( func ).
		ximpel.warn("Image.mediaPreload(): failed to preload image '" + $image[0].src + "'.");
		deferred.reject();
	});

	// Now that the event listeners on the image have been set we can start loading the image by setting its source.
	this.$image.attr('src', this.imageSource );

	// We return a jquery promise which is resolved when the image finished loading or rejected if the image fails to load.
	this.loadPromise = deferred.promise();
	return this.loadPromise;
}



// The resumePlayback() method resumes playback from a paused state. It doesn't do anything
// exceot for setting the state to PLAYING
ximpel.mediaTypeDefinitions.Image.prototype.resumePlayback = function(){
	// Indicate that the media item is in a playing state now.
	this.state = this.STATE_PLAYING;
}



// The mediaPause() is one of the required methods for a media type. XIMPEL calls the pause() method on the
// prototype which in turn calls this mediaPause() method.
ximpel.mediaTypeDefinitions.Image.prototype.mediaPause = function(){
	// Ignore this pause request if the image is not in a playing state.
	if( this.state !== this.STATE_PLAYING ){
		return;
	}
	// To pause an image we do nothing, we just set the state to paused.
	this.state = this.STATE_PAUSED;
}



// The mediaStop() is one of the required methods for a media type. XIMPEL calls the stop() method on the
// prototype which in turn calls this mediaStop() method. This method stops the image entirely. After this 
// method the image is removed from the DOM and nothing is visible anymore. The media type is in a state
// where it was in before it started playing.
ximpel.mediaTypeDefinitions.Image.prototype.mediaStop = function(){
	// Ignore this stop request if the image is already in a stopped state.
	if( this.state === this.STATE_STOPPED ){
		return;
	}
	// Indicate that the media item is now in a stopped state.
	this.state = this.STATE_STOPPED;

	// We detach and remove the image element. We just create it again when the play method is called.
	this.$image.detach();
	this.$image.remove();

	// Make sure we are back in the state the media item was in before it started playing.
	this.$image = null;
	this.loadPromise = null;
}



// Returns whether the image is playing.
ximpel.mediaTypeDefinitions.Image.prototype.mediaIsPlaying = function(){
	return this.state === this.STATE_PLAYING;
}



// Returns whether the image is paused.
ximpel.mediaTypeDefinitions.Image.prototype.mediaIsPaused = function(){
	return this.state === this.STATE_PAUSED;
}



// Returns whether the image is stopped.
ximpel.mediaTypeDefinitions.Image.prototype.mediaIsStopped = function(){
	return this.state === this.STATE_STOPPED;
}



// This method determines and sets the x, y, width and height of the image element relative to the player element
// to which the image will be attached. If no x, y , width and height were specified for the media item then it
// will be displayed as large as possible, centered, and while maintaining aspect ratio within the player element.
ximpel.mediaTypeDefinitions.Image.prototype.calculateImageDetails = function(){
	// Get the width and height of the player element.
	var playerElementWidth = this.$attachTo.width();
	var playerElementHeight = this.$attachTo.height();

	// if x and or y is "center" then we will determine the x and y coordinates when we append the image element to the DOM.
	// We do it later because we can only reliably determine the x/y coordinate when the image element is loaded and appended to the DOM.
	var x = this.x === 'center' ? '0px' : this.x; 
	var y = this.y === 'center' ? '0px' : this.y;
	
	// By now the image has been appened to the DOM. This means that we can now retrieve the intrinsic width and height 
	// of the image element. Then we need to determine the css values for width and height...
	if( !this.width && !this.height ){
		// Both width and height have not been specified. In that case we want the image
		// to be displayed as large as possible while maintaining aspect ratio of the image.
		var intrinsicWidth = this.$image[0].width;
		var intrinsicHeight = this.$image[0].height;
		var imageAspectRatio = intrinsicWidth / intrinsicHeight;
		var playerElementAspectRatio = playerElementWidth / playerElementHeight;

		if( imageAspectRatio >= playerElementAspectRatio ){
			var width = '100%';
			var height = 'auto';
		} else{
			var width = 'auto';
			var height = '100%';
		}
	} else if( !this.width ){
		// A height was specifie but no width, in this case we set the height and let the width be determined automatically.
		var width = 'auto';
		var height = this.height;
	} else if( !this.height ){
		// A width was specifie but no height, in this case we set the width and let the height be determined automatically.
		var width = this.width;
		var height = 'auto'
	} else{
		// Both were specified, so we just use that.
		var width = this.width;
		var height = this.height;
	}

	// Set the x, y, width and height for the element.
	// We need to do this before we check if x and y are equal to "center"
	// because determining the x and y to center the image can only be done if the width and height of the
	// image are known and this information is only accessible if we set it here.
	this.$image.attr({
		'width': width,
		'height': height,
	}).css({
		'position': 'absolute',
		'left': x,
		'top': y
	});

	// If x or y are set to 'center' then we use the width and height of the image element to determine the x and y coordinates such
	// that the image element is centered within the player element.
	if( this.x === 'center' ){
		var x = Math.round( Math.abs( this.$attachTo.width() - this.$image.width() ) / 2 );
	}
	if( this.y === 'center' ){
		var y = Math.round( Math.abs( this.$attachTo.height() - this.$image.height() ) / 2 );
	}
	this.$image.css({
		'left': x,
		'top': y
	});

}



// Finally we register the media type to XIMPEL such that XIMPEL knows some information about the media type.
// Information for the parser (tagname, allowedAttributes, requiredAttributes, allowedElements and requiredElements)
// and information for the XIMPEL player (the constructor such that it can create instances of the media type)
var mediaTypeRegistrationObject = new ximpel.MediaTypeRegistration( 
	'image', 							// = the media type ID (and also the tagname used in the playlist)
	ximpel.mediaTypeDefinitions.Image, 	// a pointer to the constructor function to create instances of the media type.
	{
		'allowedAttributes': ['src', 'width','height','x','y'], // the attributes that are allowed on the <image> tag (excluding the attributes that are available for every media type like duration).
		'requiredAttributes': ['src'],	// the attributes that are required on the <image> tag.
		'allowedChildren': [],			// the child elements that are allowed on the <image> tag.
		'requiredChildren': []			// The child elements that are required on the <image> tag.
	}
);

ximpel.registerMediaType( mediaTypeRegistrationObject );




// ##############################################################################################################################
// ########################################### OLD METHODS ######################################################################
// ##############################################################################################################################
// Some old methods that are not used anymore but might be useful at some point.

// Return the maximum dimensions of a rectangle that still fits in some available space (another rectangle) while maintaining aspect ratio.
/*ximpel.mediaTypeDefinitions.Image.prototype.getFittingRectangle = function( availableWidth, availableHeight, actualWidth, actualHeight ){
	var scale = Math.min( availableWidth / actualWidth, availableHeight / actualHeight );
	return {'width': actualWidth*scale, 'height': actualHeight*scale };
}
// Return the x and y coordinates for a rectangle centered within some available space (another rectangle).
ximpel.mediaTypeDefinitions.Image.prototype.getCenteredRectangleCoordinates = function( availableWidth, availableHeight, actualWidth, actualHeight ){
	var x = ( actualWidth < availableWidth ) 	? Math.round( ( availableWidth-actualWidth ) / 2 ) : 0;
	var y = ( actualHeight < availableHeight ) 	? Math.round( ( availableHeight-actualHeight ) / 2 ) : 0;
	return { 'x': x, 'y': y };
}*/

// Audio
// The Audio object implements a media type for XIMPEL to use. This media type is one of the core media types that ship with
// XIMPEL by default. MediaTypes are a sort of plugins. Anyone can create their own media type. None of the media types
// (not even the core media types) have a special integration with XIMPEL. There are just a number of requirements that should
// be fulfilled to create a MediaType (See the documentation for more info). 
//
// Notes:
// - The Audio object definition is added to the: ximpel.mediaTypeDefinitions namespace, but this is not required, it
//   could be stored in any variable.
// - The MediaType gets a new instance of ximpel.MediaType() as prototype. This gives the media type a number of predefined 
//   methods. For instance this implements a play(), pause() and stop() method which XIMPEL will call. These methods in turn
//   will call the mediaPlay(), mediaPause() and mediaStop() methods that we implement in this Audio object.
// - Besides the implementation of some required methods of a media type, the media type must be registered. This is
//   done at the bottom using the ximpel.registerMediaType() function.
//
// ##################################################################################################
// ##################################################################################################
// ##################################################################################################

// Todo:
// - Check for loading failures and handle them properly (for example: maybe add an event to the MediaType() prototype
//   object which this Audio object can throw so that XIMPEL can listen for the event and act upon the error).

// The constructor function which XIMPEL will use to create instances of our media type. Four arguments
// should be passed to the constructor function:
// - customElements - contains the child elements that were within the <audio> tag in the playlist.
// - customAttributes - contains the attributes that were on the <audio> tag in the playlist.
// - $parentElement - The element to which the audio will be appended (the ximpel player element).
// - player - A reference to the player object, so that the media type can use functions from the player.
ximpel.mediaTypeDefinitions.Audio = function( customElements, customAttributes, $parentElement, player ){
	// The custom elements that were added inside the <audio> tag in the playlist (<source> for example).
	this.customElements = customElements;

	// The custom attributes that were added to the <audio> tag in the playlist.
	this.customAttributes = customAttributes;

	// The XIMPEL player element to which this audio can attach itself (this is the element to which all media DOM nodes will be attached).
	this.$attachTo = $parentElement;

	// A reference to the XIMPEL player object. The media type can make use of functions on the player object.
	this.player = player;

	// The point in the audio from which the audio should start playing (if not specified in the playlist then it is set to 0.)
	// The statTime should be in seconds but can be a floating point number.
	this.startTime = customAttributes['startTime'] || 0;

	// will hold the audio element (or more specifically a jquery selector that points to the HTML element).
	this.$audio = null;

	// Get the <source> element that was specified in the playlist for this audio (should be one element)
	var playlistSourceElement = ximpel.filterArrayOfObjects( customElements, 'elementName', 'source' )[0];

	// Get a jquery object that selects all the html source elements that should be added to the audio element.
	this.$htmlSourceElements = this.getHtmlSourceElements( playlistSourceElement );

	// The buffering promise will hold a jQuery promise that resolves when the buffering is finished.
	// The state of the jquery promise can be checked to find out if the buffering has finished.
	this.bufferingPromise = null;

	// State of the media item.
	this.state = this.STATE_STOPPED;
}
ximpel.mediaTypeDefinitions.Audio.prototype = new ximpel.MediaType();
ximpel.mediaTypeDefinitions.Audio.prototype.STATE_PLAYING = 'state_audio_playing';
ximpel.mediaTypeDefinitions.Audio.prototype.STATE_PAUSED = 'state_audio_paused';
ximpel.mediaTypeDefinitions.Audio.prototype.STATE_STOPPED = 'state_audio_stopped';



// The mediaPlay() is one of the required methods for a media type. XIMPEL calls the play() method on the
// prototype which in turn calls this mediaPlay() method.
ximpel.mediaTypeDefinitions.Audio.prototype.mediaPlay = function(){
	// Ignore this call if this media item is already playingor resume playback if its paused.
	if( this.state === this.STATE_PLAYING ){
		return;
	} else if( this.state === this.STATE_PAUSED ){
		this.resumePlayback();
		return;
	}

	// Indicate that the media item is in a playing state now.
	this.state = this.STATE_PLAYING;

	// Create the audio element but don't attach it to the DOM yet and don't start loading untill we call .load()
	var $audio = this.$audio = $('<audio />', {
		'preload': 'none'
	});
	var audioElement = $audio[0];

	// Add the HTML source elements to the audio element. (the browser will pick which source to use once the audio starts loading).
	$audio.append( this.$htmlSourceElements );

	// Every media type which has an ending should call the .ended() method when the media has ended. 
	// ended() is a method on the prototype. By calling the ended() method, all handler functions registered
	// with .addEventHandler('end', handlerFunc) will be called. Here we indicate that the .ended() method will be
	// called when the 'ended' event on the audio element is triggered (ie. when the audio has nothing more to play).
	$audio.on('ended', this.ended.bind(this) );
	
	// Set an event listener (that runs only once) for the loadedmetadata event. This waits till the metadata of the audio
	// (duration) has been loaded and then executes the function.
	$audio.one("loadedmetadata", function(){
		// This function is executed once the metadata of the audio has been loaded...
		// Set the current position in the audio to the appropriate startTime (this can only be done after the metadata is loaded).
		audioElement.currentTime = this.startTime;

		// Attach the audio element to the DOM.
		$audio.appendTo( this.$attachTo );
	}.bind(this) );

	// Next we create a jquery deferred object (promise) and we give it a function that runs when the deferred
	// object is resolved. The deferred will be resolved as soon as the canplaythrough event is thrown by the audio element.
	var bufferingDeferred = new $.Deferred();
	bufferingDeferred.done( function(){
		// this functions runs when the deferred is resolved (ie. the initial buffering is finished)...
		// When the buffering is done and the media item is still in a playing state then play the 
		// media item, otherwise do nothing. It may be the case that the media item is in a non-playing
		// state when the pause() method has been called during the buffering.
		if( this.state === this.STATE_PLAYING ){
			audioElement.play();
		}
	}.bind(this) );


	// Set an event listener for the canplaythough event. This waits until enough of the audio has been loaded 
	// to play without stuttering (as estimated by the browser). Note that the canplaythrough event has some browser 
	// differences. Some browsers call it multiple times and others call it only once. It is also not clear whether
	// canplaythrough means the audio has enough data to play from the beginning or has enough data to play from 
	// the audio's current playback time. This means that the audio may not be preloaded properly even when the 
	// canplaythrough event is thrown. However, every major browser calls it once at least, so we just listen
	// for the event and can only hope that enough of the audio has been buffered to start playing smoothly.
	$audio.one("canplaythrough", function(){
		// The audio is preloaded. We resolve the bufferingDeferred object so that the registered callbacks are 
		// called (the callbacks registered with bufferingDeferred.done() bufferingDeferred.fail() etc)
		bufferingDeferred.resolve();
	}.bind(this) );

	// Attach a handler function for when the audio fails to load.
	$audio.error( function(e){
		ximpel.warn("Audio.mediaPlay(): failed to buffer the audio: '" + audioElement.src + "'.");
		bufferingDeferred.reject();
	}.bind(this) );

	// start loading the audio now.
	audioElement.load();

	this.bufferingPromise = bufferingDeferred.promise();
	return this.bufferingPromise;
}



// The resumePlayback() method resumes playback from a paused state.
ximpel.mediaTypeDefinitions.Audio.prototype.resumePlayback = function(){
	// Indicate that the media item is in a playing state now.
	this.state = this.STATE_PLAYING;
	if( this.bufferingPromise.state() === "resolved" ){
		this.$audio[0].play();
	}
}



// The mediaPause() is one of the required methods for a media type. XIMPEL calls the pause() method on the
// prototype which in turn calls this mediaPause() method.
ximpel.mediaTypeDefinitions.Audio.prototype.mediaPause = function(){
	// Ignore this pause request if the audio is not in a playing state.
	if( this.state !== this.STATE_PLAYING ){
		return;
	}
	this.state = this.STATE_PAUSED;

	// Pause the audio element.
	this.$audio[0].pause();
}



// The mediaStop() is one of the required methods for a media type. XIMPEL calls the stop() method on the
// prototype which in turn calls this mediaStop() method. This method stops the audio entirely without being 
// able to resume later on. After this method the audio playback pointer has been reset to its start position
// and the audio element is removed such that the browser will not proceed loading the audio and nothing is
// visible anymore.
ximpel.mediaTypeDefinitions.Audio.prototype.mediaStop = function(){
	// Ignore this stop request if the audio is already in a stopped state.
	if( this.state === this.STATE_STOPPED ){
		return;
	}
	// Indicate that the media item is now in a stopped state.
	this.state = this.STATE_STOPPED;

	var $audio = this.$audio;
	var audioElement = this.$audio[0];
	audioElement.pause();

	// We need to tell the audio to stop loading. We do this by setting the src of the audio element to "" and
	// then tell it to start loading that. Because "" is not a valid src browsers will stop loading the audio
	// element entirely.
	audioElement.src = "";
	audioElement.load();

	// We detach and remove the audio element. We just create it again when the play method is called.
	$audio.detach();
	$audio.remove();

	// Make sure we are back in the state the media item was in before it started playing.
	this.$audio = null;
	this.bufferingPromise = null;
}



// Returns whether the audio is playing.
ximpel.mediaTypeDefinitions.Audio.prototype.mediaIsPlaying = function(){
	return this.state === this.STATE_PLAYING;
}



// Returns whether the audio is paused.
ximpel.mediaTypeDefinitions.Audio.prototype.mediaIsPaused = function(){
	return this.state === this.STATE_PAUSED;
}



// Returns whether the audio is stopped.
ximpel.mediaTypeDefinitions.Audio.prototype.mediaIsStopped = function(){
	return this.state === this.STATE_STOPPED;
}



// Every media item can implement a getPlayTime() method. If the media type implements this method then 
// ximpel will use this method to determine how long the media item has been playing. If this method is 
// not implemented then ximpel itself will calculate how long a media item has been playing. Note that
// the media item can sometimes better determine the play time. For instance, if the network has problems
// causing the audio to stop loading, then ximpel would not be able to detect this and use an incorrect 
// play time. An audio media item could still determine the correct play time by looking at the current 
// playback time of the audio element (something that the core of ximpel has no access to). This is exactly 
// what the getPlayTime method of this audio media item does. It returns the play time in miliseconds.
ximpel.mediaTypeDefinitions.Audio.prototype.getPlayTime = function(){
	var audioElement = this.$audio[0];
	if( audioElement.currentTime == 0 ){
		return 0;
	} else{
		return (audioElement.currentTime - this.startTime) * 1000;
	}
}



// In the ximpel playlist there is one source element for each <audio>. Within this source element multiple sources can 
// be specified by using the extensions and types attribute to specify multiple source files. This method takes the 
// custom source element specified in the playlist and returns a jquery object containing one or more HTML5 source 
// elements. The returned set of HTML5 source elements can be appended to the html5 <audio> element such that the 
// browser can choose wich source it uses.
ximpel.mediaTypeDefinitions.Audio.prototype.getHtmlSourceElements = function( playlistSourceElement ){
	// The source element in the playlist looks like this: 
	// <source file="somefilename" extensions="mp3, ogg" types="audio/mp3, audio/ogg" />
	// The attributes "file", "extensions" and "types" are accesible via: playlistSourceElement.elementAttributes.<attributename>

	// The name/path of the file (without the file extension)
	var filename = playlistSourceElement.elementAttributes.file;
	
	// The extensions attribute contains a comma seperated list of available file extensions. If the extension attribute
	// has the value: "mp3, wav", then it means that there is a <filePath>.mp3 and a <filePath>.wav availabe.
	var extensions = playlistSourceElement.elementAttributes.extensions || "";
	extensions = extensions.replace(/\s/g, ""); // remove white space characters
	extensionsArray = extensions.split(",");    // split the comma seperated extensions into an array.

	// The types attribute contains a comma seperated list of mime types. The first mime type corresponds to the first extension
	// listed in the extensions attribute, the second mime type to the second extension and so on. 
	var types = playlistSourceElement.elementAttributes.types || "";
	types = types.replace(/\s/g, "");
	typesArray = types !== "" ? types.split(",") : [];

	// For each of the listed extensions we create a <source> element with a corresponding src attribute and type attribute.
	var $sources = $([]);
	for( var i=0; i<extensionsArray.length; i++ ){
		var type = typesArray[i] || "";
		var src = filename+"."+extensionsArray[i];

		// Check if a media directory was specified in the XIMPEL config, if so the src is made to be relative to this mediaDirectory
		var mediaDirectory = this.player.getConfigProperty("mediaDirectory") || "";
		if( mediaDirectory != "" ){
			src = mediaDirectory + "/" + src; 
		}

		// Create the actual <source> element with a src and type attribute.
		var $source = $('<source />').attr({
			'src': src,
			'type': type
		});

		// Add the created source to a jquery selected that will select all source elements.
		$sources = $sources.add( $source );
	}

	// return a jquery object containing the source elements.
	return $sources;
}




// Finally we register the media type to XIMPEL such that XIMPEL knows some information about the media type.
// Information for the parser (tagname, allowedAttributes, requiredAttributes, allowedElements and requiredElements)
// and information for the XIMPEL player (the constructor such that it can create instances of the media type)
var mediaTypeRegistrationObject = new ximpel.MediaTypeRegistration( 
	'audio', 								// = the media type ID (and also the tagname used in the playlist)
	ximpel.mediaTypeDefinitions.Audio, 		// a pointer to the constructor function to create instances of the media type.
	{
		'allowedAttributes': [],			// the attributes that are allowed on the <audio> tag (excluding the attributes that are available for every media type like duration).	
		'requiredAttributes': [],			// the attributes that are required on the <audio> tag.
		'allowedChildren': ['source'],		// the child elements that are allowed on the <audio> tag.
		'requiredChildren': ['source']		// The child elements that are required on the <audio> tag.
	}
);

ximpel.registerMediaType( mediaTypeRegistrationObject );

// Youtube
// The Youtube object implements a media type for XIMPEL to use. This media type is one of the core media types that ship with
// XIMPEL by default. MediaTypes are a sort of plugins. Anyone can create their own media type. None of the media types
// (not even the core media types) have a special integration with XIMPEL. There are just a number of requirements that should
// be fulfilled to create a MediaType (See the documentation for more info). 
//
// Notes:
// - The Youtube object definition is added to the: ximpel.mediaTypeDefinitions namespace, but this is not required, it
//   could be stored in any variable.
// - The MediaType gets a new instance of ximpel.MediaType() as prototype. This gives the media type a number of predefined 
//   methods. For instance this implements a play(), pause() and stop() method which XIMPEL will call. These methods in turn
//   will call the mediaPlay(), mediaPause() and mediaStop() methods that we implement in this Youtube object.
// - Besides the implementation of some required methods of a media type, the media type must be registered. This is
//   done at the bottom using the ximpel.registerMediaType() function.
//
// ##################################################################################################
// ##################################################################################################
// ##################################################################################################

// TODO: 
// - Youtube API: As an extra security measure, you should also include the origin parameter to the URL, specifying the URL scheme (http:// or https://) and full domain of your host page as the parameter value
// - Make it such that not all youtube elements are attached (but invisble) to the DOM at all times (even when their not being played).
// - Proper error handling (for example throw an event when a loading error occurs which ximpel can listen to?)



// The constructor function which XIMPEL will use to create instances of our media type. Four arguments
// should be passed to the constructor function:
// - customElements - contains the child elements that were within the <youtube> tag in the playlist.
// - customAttributes - contains the attributes that were on the <youtube> tag in the playlist.
// - $parentElement - The element to which the youtube iframe will be appended (the ximpel player element).
// - player - A reference to the player object, so that the media type can use functions from the player.
ximpel.mediaTypeDefinitions.YouTube = function( customElements, customAttributes, $parentElement, player ){
	// The custom elements that were added inside the <youtube> tag in the playlist.
	this.customElements = customElements; // not used right now.

	// The custom attributes that were added to the <youtube> tag in the playlist.
	this.customAttributes = customAttributes;

	// The XIMPEL player element to which this youtube video can attach itself (this is the element to which all media DOM nodes will be attached).
	this.$attachTo = $parentElement;

	// A reference to the XIMPEL player object. The media type can make use of functions on the player object.
	this.player = player;

	// The youtube video id (can be found in the URL of a youtube video).
	this.videoId = customAttributes.id;

	// Set mute audio
	this.mute = customAttributes.mute;

	// The x coordinate of the video relative to the ximpel player element or 'center' to align center.
	// The value for x should include the units (for instance: 600px or 20%)
	this.x = customAttributes.x || 'center';

	// The y coordinate of the video relative to the ximpel player element or 'center' to align center.
	// The value for y should include the units (for instance: 600px or 20%)
	this.y = customAttributes.y || 'center';

	// The width of the youtube element. The value includes units (ie. 600px or 20%).
	this.width = customAttributes.width || this.$attachTo.width() +'px';

	// The height of the youtube element. The value includes units (ie. 600px or 50%)
	this.height = customAttributes.height || this.$attachTo.height() + 'px';

	// The point in the video from which youtube should start playing (if not specified in the playlist then it is set to 0.)
	// The statTime should be in seconds but can be a floating point number.
	this.startTime = customAttributes.startTime || 0;

	// This is will hold the the jquery selector of the wrapper element for all youtube's DOM nodes (such as the youtube iframe element) 
	this.$youtubeContainer = null;

	// The youtube player requires an element which will be replaced by youtube's iframe, ie. a placeholder element
	this.$youtubePlaceholder = null;

	// Youtube has assigned click handlers to its iframe which cause the video to pause. This is not what
	// we want in ximpel because we want a clear and consistent user interaction for all media types. So we
	// use a "click catcher" element that will be placed over the youtube's iframe which ignores all click handlers.
	this.$youtubeClickCatcher = null;

	// This will contain the youtube player object which can be used to start and pause the video
	this.youtubePlayer = null;

	// This will hold a jquery promise object that indicates if the this.youtubePlayer is ready to play.
	this.readyToPlayPromise = null;

	// The state indicates the state of the youtube media item (playing, paused, stopped)
	this.state = this.STATE_STOPPED;
}
ximpel.mediaTypeDefinitions.YouTube.prototype = new ximpel.MediaType();
ximpel.mediaTypeDefinitions.YouTube.prototype.CLASS_YOUTUBE_CONTAINER = 'youtubeContainer';
ximpel.mediaTypeDefinitions.YouTube.prototype.CLASS_YOUTUBE_CLICK_CATCHER = 'youtubeClickCatcher';
ximpel.mediaTypeDefinitions.YouTube.prototype.STATE_PLAYING = 'state_youtube_playing';
ximpel.mediaTypeDefinitions.YouTube.prototype.STATE_PAUSED = 'state_youtube_paused';
ximpel.mediaTypeDefinitions.YouTube.prototype.STATE_STOPPED = 'state_youtube_stopped';



// The mediaPlay() is one of the required methods for a media type. XIMPEL calls the play() method on the
// prototype which in turn calls this mediaPlay() method.
ximpel.mediaTypeDefinitions.YouTube.prototype.mediaPlay = function(){
	// Ignore this call if this media item is already playing or resume playback if its paused.
	if( this.state === this.STATE_PLAYING ){
		return;
	} else if( this.state === this.STATE_PAUSED ){
		this.resumePlayback();
		return;
	}

	// Indicate that the media item is in a playing state now.
	this.state = this.STATE_PLAYING;

	// Before we can create Youtube Player objects we need to load the Youtube API script. So we first check if the script
	// has already been loaded by another instance of this Youtube media type. If it has then we don't need to do it again. 
	// We can check if it has because a jquery promise will have been stored in: ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise 
	// If such an object exists then the script is either in the process of being loaded, or completed/failed to load.
	if( ! ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise ){
		// Start loading the youtube api script. This stores ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise which is a jquery
		// promise object that is resolved when the script has been loaded or is rejected when the script failed to load.
		var apiLoadDeferred = this.loadYoutubeApi();
	}

	// Create and initialize some HTML elements (they will be attached to the DOM, but not displayed yet)
	this.initYoutubeElements();

	// Two things need to be loaded in order to start playing a youtube video:
	// - The youtube API script (is already being loaded by now)
	// - The youtube player.
	// We create a combined jquery deferred which resolves if both of these items are loaded or fails if any of them fail.
	var playerLoadDeferred = new $.Deferred();
	var readyToPlayDeferred = $.when( apiLoadDeferred, playerLoadDeferred ); // this is the combined deferred.
	this.readyToPlayPromise = readyToPlayDeferred.promise();

	// Register a callback for when the combined deferred is resolved (ie. when both the API script and the Youtube player are loaded)
	readyToPlayDeferred.done( function(){
		// start playing the youtube player.
		this.playYoutube();
	}.bind(this) );

	// Check the state of youtube API script (ie. if its loaded yet or not)
	if( ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise.state() === "resolved" ){
		// API script is loaded, so start loading the player.
		this.loadYoutubePlayer( playerLoadDeferred ); 
	} else if( ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise.state() === "pending" ){
		// API script loading is not yet finished so register a callback that is called when the API
		// is loaded which will will start loading the youtube player. 
		ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise.done( function(){
			this.loadYoutubePlayer( playerLoadDeferred ); 
		}.bind(this) );
	} else if( ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise.state() === "rejected" ){
		// The API script failed to load.
		ximpel.warn("YouTube.mediaPlay(): failed to play the youtube element the youtube API didn't load properly.");
		return;
	}
}



// The resumePlayback() method resumes playback from a paused state.
ximpel.mediaTypeDefinitions.YouTube.prototype.resumePlayback = function(){
	// Indicate that the media item is in a playing state now.
	this.state = this.STATE_PLAYING;
	if( this.readyToPlayPromise && this.readyToPlayPromise.state() === "resolved" ){
		this.youtubePlayer.playVideo();
	}
}



// This method starts loading the youtube api. When it finishes it will resolve
// the jquery promise stored in: ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise
// The state of this promise can be checked at any time to find out the state of the
// loading of the youtube API script.
ximpel.mediaTypeDefinitions.YouTube.prototype.loadYoutubeApi = function(){
	if( ! ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise ){
		// Store a jquery promise object on the ximpel.mediaTypeDefinitions.YouTube object to track if the youtube 
		// api script is loaded or not. The ximpel.mediaTypeDefinitions.YouTube object is not instance specific
		// but available to all instances of youtube. We do this because the API only needs to be loaded once, then
		// all Youtube instances can use it.
		var apiLoadDeferred = new $.Deferred();
		ximpel.mediaTypeDefinitions.YouTube.apiLoadPromise = apiLoadDeferred.promise();

		// If there was any third party code that uses the youtube api then it may have 
		// registered the window.onYouTubeIframeAPIReady() function already. In that case we 
		// overwrite that function with our own, but we call the third party function from our own function.
		var thirdPartyOnYouTubeIframeAPIReadyHandler = window.onYouTubeIframeAPIReady;
		
		// Define the event handling function that is called by youtube's script when it is fully loaded.
		window.onYouTubeIframeAPIReady = function(){
			// When the script is fully loaded, then the apiLoadDeferred is resolved.
			// All youtube instances that have attached a .done() method on this deferred/promise will
			// now have their function called.
			apiLoadDeferred.resolve();

			// And if there was an onYouTubeIframeAPIReady() function registered by any third party code, 
			// then we will call that function just to not break webpages that use it.
			if( thirdPartyOnYouTubeIframeAPIReadyHandler ){
				thirdPartyOnYouTubeIframeAPIReadyHandler();
			}
		}.bind(this);

		// Start loading the youtube API
		this.requestYoutubeApiScript( apiLoadDeferred );
		return apiLoadDeferred;
	} 
}
// This will make a request for the youtube API script.
ximpel.mediaTypeDefinitions.YouTube.prototype.requestYoutubeApiScript = function( apiLoadDeferred ){
	// We do the actual ajax request for the youtube api script.
	var ajaxRequest = $.ajax({
	    type: "GET",
	    url: "https://www.youtube.com/iframe_api",
	    dataType: "script",
	    cache: true
	});

	// When the script has failed to load, then we reject the deferred that was passed to this function.
	ajaxRequest.fail( function( jqXHR, textStatus, errorThrown ){
		ximpel.warn("YouTube.loadYoutubeApi(): failed to load the youtube api script (" + textStatus + ", " + errorThrown + ")");
		apiLoadDeferred.reject();
	}.bind(this) );

	// Note: we do NOT resolve the deferred here because the loaded script first needs to run and initialize
	// the youtube player api. We will know when this is ready because the script will call the function
	// window.onYouTubeIframeAPIReady which we registered earlier in Youtube.loadYoutubeApi().

    return apiLoadDeferred.promise();
}



// This will load the youtube player. After the youtube player is ready the this.readyToPlayPromise will be resolved.
ximpel.mediaTypeDefinitions.YouTube.prototype.loadYoutubePlayer = function( deferred ){
	// The function to be called when the youtube player is ready to be used.
	var youtubePlayerReadyHandler = function(){
		deferred.resolve();
	}

	this.youtubePlayer = new YT.Player( this.$youtubePlaceholder[0], {
		videoId: this.videoId,
		height: this.height,
  		width: this.width,
	    events: {
	        'onError': this.youtubePlayerErrorHandler.bind(this, deferred ),
	        'onReady': youtubePlayerReadyHandler.bind(this),
	        'onStateChange': this.youtubePlayerStateChangeHandler.bind(this)
	    },
	    playerVars: {
	    	/*'enablejsapi': 1,*/
	    	'html5': 1, 		// use the html5 player?
			'autoplay': 0,		// auto play video on load?
     		'controls': 0, 		// show controls?
     		'rel' : 0, 			// show related videos at the end?
     		'showinfo': 0,		// show video information?
     		'disablekb': 1,		// disable keyboard shortcuts?
     		'wmode': 'opaque',
     		'modestbranding': 0,
     		'iv_load_policy': 3, // show annotations? (3=no, 1 =yes)
     		'start': this.startTime
		}
	});

	return deferred;
}



// This tells the youtube player to start playing. It also shows and positions the youtube element at the appropriate position.
ximpel.mediaTypeDefinitions.YouTube.prototype.playYoutube = function(){
	this.repositionYoutubeIframe();
	if (this.mute) {
		this.youtubePlayer.mute();
	}
	else {
		this.youtubePlayer.unMute();
	}

	this.youtubePlayer.playVideo();
	this.$youtubeContainer.show();
}



// Create the youtube elements that are used by this media type and set some attributes.
ximpel.mediaTypeDefinitions.YouTube.prototype.initYoutubeElements = function(){
	// Create the wrapper HTML element for the youtube's iframe element.
	this.$youtubeContainer = $('<div></div>');

	// The youtube player requires an element which will be replaced by youtube's iframe, ie. the a placeholder:
	this.$youtubePlaceholder = $('<div></div>');

	// Youtube has assigned click handlers to its iframe which cause the video to pause. This is not what
	// we want in ximpel because we want a clear and consistent user interaction for all media types. So we
	// use a "click catcher" element that will be placed over the youtube's iframe which ignores all click handlers.
	this.$youtubeClickCatcher = $('<div></div>');


	this.$youtubeContainer.addClass( this.CLASS_YOUTUBE_CONTAINER );
	this.$youtubeClickCatcher.addClass( this.CLASS_YOUTUBE_CLICK_CATCHER );

	// Combine the youtube container and youtube click catcher elements in one jquery object.
	var $containerAndClickCatcher = this.$youtubeContainer.add( this.$youtubeClickCatcher );

	// Then style both of them, append them to the DOM and hide them.
	$containerAndClickCatcher.css({
		'position': 'absolute',
		'width': '100%',
		'height': '100%',
		'top': '0px',
		'left': '0px',
		'z-index': 1,
	});

	// Hide the youtube container then append the clickcatcher and the placeholder element.
	this.$youtubeContainer.hide();
	this.$youtubeClickCatcher.appendTo( this.$youtubeContainer );
	this.$youtubeContainer.appendTo( this.$attachTo );

	// Append the youtube place holder element to the youtube container. 
	// (the placeholder will be replaced with youtube's iframe).
	this.$youtubePlaceholder.appendTo( this.$youtubeContainer );
}




ximpel.mediaTypeDefinitions.YouTube.prototype.repositionYoutubeIframe = function(){
	var $youtubeIframe = this.$youtubeContainer.find("iframe");
	$youtubeIframe.css({
		'position': 'absolute'
	});

	if( this.x === 'center' ){
		var x = Math.round( Math.abs( this.$attachTo.width() - $youtubeIframe.width() ) / 2 ) + 'px';
	} else{
		var x = this.x;
	}
	if( this.y === 'center' ){
		var y = Math.round( Math.abs( this.$attachTo.height() - $youtubeIframe.height() ) / 2 )  + 'px';
	} else{
		var y = this.y;
	}
	$youtubeIframe.css({
		'left': x,
		'top': y 
	});
}



// Define what should happen in case of different error messages.
ximpel.mediaTypeDefinitions.YouTube.prototype.youtubePlayerErrorHandler = function( deferred, error ){
	if( error.data == 2 ){
       ximpel.warn("YouTube.youtubePlayerErrorHandler(): invalid parameters received. Possibly the video id is invalid.");
    } else if( error.data == 5 ){
    	ximpel.warn("YouTube.youtubePlayerErrorHandler(): The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.");
    } else if( error.data == 100 ){
    	ximpel.warn("YouTube.youtubePlayerErrorHandler(): The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.");
	} else if( error.data == 101 || error.data == 150 ){
		ximpel.warn("YouTube.youtubePlayerErrorHandler(): The owner of the requested video does not allow it to be played in embedded players.");
	} else{
		ximpel.warn("YouTube.youtubePlayerErrorHandler(): An unknown error has occured while starting the youtube player.");
	}
	deferred.reject();
}



// This is called when the youtube player changes state.
ximpel.mediaTypeDefinitions.YouTube.prototype.youtubePlayerStateChangeHandler = function( event ){
	var state = event.data;

	switch( state ){
		case YT.PlayerState.ENDED: 
			// The youtube video has ended. By calling ended() all callback functions registered with 
			// .addEventHandler('end', func) will be called. ended() and addEventHandler() are both functions 
			// on the prototype of this media type.
			this.ended(); 
			break;
	}
}



// The pause method pauses the youtube video if the video is in a playing state, otherwise it does nothing.
ximpel.mediaTypeDefinitions.YouTube.prototype.mediaPause = function(){
	// Ignore this pause request if the video is not in a playing state.
	if( this.state !== this.STATE_PLAYING ){
		return;
	}
	this.state = this.STATE_PAUSED;

	if( this.youtubePlayer && this.youtubePlayer.pauseVideo ){
		this.youtubePlayer.pauseVideo();
	}
}



// The stop method stops the video entirely without being able to resume later on. After this method the video playback pointer
// has been reset to its start position and the youtube i frame element is detached from the DOM, so nothing is visible anymore.
ximpel.mediaTypeDefinitions.YouTube.prototype.mediaStop = function(){
	if( this.state === this.STATE_STOPPED ){
		return;
	}
	this.state = this.STATE_STOPPED;
	this.youtubePlayer.pauseVideo();
	this.youtubePlayer.destroy();
	this.$youtubeContainer.remove();
	this.$youtubeContainer = null;
	this.$youtubePlaceholder = null;
	this.$youtubeClickCatcher = null;
	this.youtubePlayer = null;
	this.readyToPlayPromise = null;
}



// Every media item can implement a getPlayTime() method. If the media type implements this method then 
// ximpel will use this method to determine how long the media item has been playing. If this method is 
// not implemented then ximpel itself will calculate how long a media item has been playing. Note that
// the media item can sometimes better determine the play time. For instance, if the network has problems
// causing the video to stop loading, then ximpel would not be able to detect this and use an incorrect 
// play time. A Youtube media item could still determine the correct play time by looking at the current 
// playback time of the youtube player object (something that the core of ximpel has no access to). This is exactly 
// what the getPlayTime method of this youtube media item does. It returns the play time in miliseconds.
ximpel.mediaTypeDefinitions.YouTube.prototype.getPlayTime = function(){
	if( ! this.youtubePlayer || !this.youtubePlayer.getCurrentTime ){
		return 0;
	}
	var currentPlaybackTimeInMs = this.youtubePlayer.getCurrentTime()*1000;
	var startTimeInMs = this.startTime * 1000;
	var playTimeInMs = currentPlaybackTimeInMs - startTimeInMs;
	return playTimeInMs;
}



// Returns whether the video is playing.
ximpel.mediaTypeDefinitions.YouTube.prototype.mediaIsPlaying = function(){
	return this.state === this.STATE_PLAYING;
}



// Returns whether the video is paused.
ximpel.mediaTypeDefinitions.YouTube.prototype.mediaIsPaused = function(){
	return this.state === this.STATE_PAUSED;
}



// Returns whether the video is stopped.
ximpel.mediaTypeDefinitions.YouTube.prototype.mediaIsStopped = function(){
	return this.state === this.STATE_STOPPED;
}



// Finally we register the media type to XIMPEL such that XIMPEL knows some information about the media type.
// Information for the parser (tagname, allowedAttributes, requiredAttributes, allowedElements and requiredElements)
// and information for the XIMPEL player (the constructor such that it can create instances of the media type)
var mediaTypeRegistrationObject = new ximpel.MediaTypeRegistration( 
	'youtube',  							// = the media type ID (and also the tagname used in the playlist)
	ximpel.mediaTypeDefinitions.YouTube,	// a pointer to the constructor function to create instances of the media type.
	{
		'allowedAttributes': ['mute', 'videoId', 'width', 'height', 'x', 'y', 'startTime'], // the attributes that are allowed on the <youtube> tag (excluding the attributes that are available for every media type like duration).
		'requiredAttributes': ['videoId'],	// the attributes that are required on the <youtube> tag.
		'allowedChildren': ['source'],		// the child elements that are allowed on the <youtube> tag.
		'requiredChildren': ['source'] 		// The child elements that are required on the <youtube> tag.
	}
);

ximpel.registerMediaType( mediaTypeRegistrationObject );