import { Trait } from "./index.js";
import { args, tag } from "./utils/index.js";

/**
 * Creates types.
 * 
 * @param {String} name type name
 */
export default function Type( name )
{
	if( ! ( this instanceof Type ))
	{
		return new Type( name );
	}
	
	if( typeof( name ) !== "string" || /^[a-z_$]{1}[a-z0-9_$]*$/i.test( name ) === false )
	{
		throw TypeError(
			"In order to create a type, you need to provide a valid value as a " + 
			"string in the first parameter, which can also be a function name!"
		);
	}

	/**
	 * Singleton instance of the type.
	 * 
	 * @type {Object}
	 */
	var singletones = {}

	/**
	 * Implemented interfaces list.
	 * 
	 * @type {Array}
	 */
	var implementList = [];

	/**
	 * Type name.
	 * 
	 * @type {String}
	 */
	this.name = name[ 0 ].toUpperCase() + name.slice( 1 );

	/**
	 * List of inherited type names.
	 * 
	 * @type {Array}
	 */
	this.types = [ this.name ];

	/**
	 * List of inherited trait names.
	 * 
	 * @type {Array}
	 */
	this.behaviours = [];

	/**
	 * The parent type from which this type inherited.
	 * 
	 * @type {Type}
	 */
	this.parent = null;

	/**
	 * Constructor method to represent the type natively.
	 * 
	 * @type {Function}
	 */
	this.constructor = eval( "( function " + this.name + "(){})" );

	/**
	 * Copies the properties of the given trait(s) into the properties
	 * of this type. Props are copied to the prototype of the constructor of
	 * this type, that is, the copied props appear as if they were props of
	 * this type.
	 * 
	 * @param {Array} ...parents traits to use
	 * @return {Type}
	 */
	this.use = function()
	{
		args( arguments ).forEach( function( trait )
		{
			renameTraitConstructMethod( trait );
			extend( this, trait.properties );

			this.behaviours = this.behaviours.concat( trait.types );
		},
		this );

		return this;
	}

	/**
	 * Embeds a new context into the type's prototype.
	 * 
	 * @param {Object} context
	 * @return {this}
	 */
	this.prototype = function( context )
	{
		extend( this, context );

		if( this.parent )
		{
			inherit( this );
		}

		renameTraitMethods( this );
		runInterfaceImplementations( this );

		extend( this,
		{
			type: this,
			is: this.is,
			behave: this.behave,
			super: this.super
		});

		return this;
	}

	/**
	 * Allows the represented type to inherit another type.
	 * 
	 * @param {Type} parent a type to inherit
	 * @return {this}
	 */
	this.extends = function( parent )
	{
		this.parent = parent;
		this.types = this.types.concat( parent.types );
		this.behaviours = this.behaviours.concat( parent.behaviours );

		return this;
	}

	/**
	 * Adds interfaces to implement list.
	 * 
	 * @param {Array<Interface>} interfaces
	 * @returns {this}
	 */
	this.implements = function()
	{
		implementList = args( arguments );

		return this;
	}

	/**
	 * Creates and returns an object from the type.
	 * 
	 * @return {Object}
	 */
	this.new = function()
	{
		var instance = new this.constructor;

		callTraitInitializers( instance );
		igniteConstructMethod( instance, arguments );

		return instance;
	}

	/**
	 * Instantiates and returns the constructor method of the represented
	 * type with the given parameters. Its difference from the new method
	 * is that it always returns the same instance instead of producing a
	 * new instance every time it is run.
	 * 
	 * @param {String|Number|Symbol} key instance key to access it later
	 * @param {Array} args arguments to pass when instantiating the type
	 * @return {Object}
	 */
	this.singleton = function( key, args )
	{
		return singletones[ key ] ||
			( singletones[ key ] = this.new.apply( this, args ));
	}

	/**
	 * Tells whether the represented type inherits a given type.
	 * 
	 * @param {Type} target a type name or a type to check
	 * @return {Boolean}
	 */
	this.is = function( target )
	{
		if( target instanceof Type )
		{
			target = target.name;
		}
		
		if( this instanceof Type )
		{
			return this.types.indexOf( target ) > -1;
		}
		
		if( this.type && this.type instanceof Type )
		{	
			return this.type.types.indexOf( target ) > -1;
		}
		
		return false;
	}

	/**
	 * Tells whether the represented type inherits a given trait.
	 * 
	 * @param {Trait|String} target a trait name or trait's itself to check
	 * @return {Boolean}
	 */
	this.behave = function( trait )
	{
		if( trait instanceof Trait )
		{
			trait = trait.name;
		}
		
		if( this instanceof Type )
		{
			return this.behaviours.indexOf( trait ) > -1;
		}
		
		if( this.type && this.type instanceof Type )
		{	
			return this.type.behaviours.indexOf( trait ) > -1;
		}
		
		return false;
	}

	/**
	 * Allows accessing a method of an inherited parent type.
	 */
	this.super = function()
	{
		var context = this instanceof Type
			? this.parent
			: this.type.parent;

		if( ! context )
		{
			return;
		}

		context = context.constructor.prototype;

		if( arguments.length == 0 )
		{
			return context;
		}

		var method = "construct";
		var arg = args( arguments );
		var isFirstArgStr = tag( arg[ 0 ]) == "[object String]";
		var isSecondArgArray = tag( arg[ 1 ]) == "[object Array]";

		if( arg.length == 2 && isFirstArgStr && isSecondArgArray )
		{
			method = arg.shift();
			arg = arg.shift();
		}
		else if( arg.length == 1 && isFirstArgStr )
		{
			method = arg.shift();
		}

		if( context[ method ] !== this.constructor.prototype[ method ])
		{
			return context[ method ].apply( this, arg );
		}
	}
	
	function renameTraitConstructMethod( trait )
	{
		if( trait.properties.construct )
		{
			trait.properties[ "construct" + trait.name + "Trait" ] = trait.properties.construct;
			delete trait.properties.construct;
		}
	}

	function extend( type, context )
	{
		Object.assign( type.constructor.prototype, context );
		return type;
	}

	function renameTraitMethods( type )
	{
		var AS;
		var proto = type.constructor.prototype;

		if( ! ( AS = proto.AS ))
		{
			return;
		}
		
		for( var oldMethodName in AS )
		{
			proto[ AS[ oldMethodName ]] = proto[ oldMethodName ];
			delete proto[ oldMethodName ];
		}

		delete proto.AS;
	}

	function inherit( type )
	{
		var target = type.constructor.prototype;
		var context = type.parent.constructor.prototype;

		for( var prop in context )
		{
			if( prop in target )
			{
				continue;
			}
			
			target[ prop ] = context[ prop ];
		}
	}

	function callTraitInitializers( instance )
	{
		instance.type.behaviours.forEach( behaviour =>
		{
			var initializer;

			if( initializer = instance[ "construct" + behaviour + "Trait" ])
			{
				initializer.call( instance );
			}
		});
	}

	function igniteConstructMethod( instance, initialArgs )
	{
		if( instance.construct instanceof Function )
		{
			instance.construct.apply( instance, args( initialArgs ));
		}
	}

	function runInterfaceImplementations( type )
	{
		for( var imp of implementList )
		{
			imp.apply( type );
		}
	}
}
