/**
 * Creates types.
 * 
 * @param {String} name type name
 */
export default function type( name )
{
	if( ! ( this instanceof type ))
	{
		return new type( name );
	}
	
	if( typeof( name ) !== "string" || /^[a-z_$]{1}[a-z0-9_$]*$/i.test( name ) === false )
	{
		throw TypeError(
			"In order to create a type, you need to provide a valid value as a " + 
			"string in the first parameter, which can also be a function name!"
		);
	}
	
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
	 * Singleton instance of the type.
	 * @type {Object}
	 */
	this.instance = null;

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
	 * @param {Trait} ...parents traits list
	 * @return {this}
	 */
	this.use = function( parents )
	{
		Array.prototype.slice.call( arguments ).forEach( function( trait )
		{
			this.renameTraitConstructMethod( trait );
			this.extendPrototype( trait.properties );

			this.behaviours = this.behaviours.concat( trait.types );
		},
		this );

		return this;
	}

	this.renameTraitConstructMethod = function( trait )
	{
		if( trait.properties.construct )
		{
			trait.properties[ "construct" + trait.name + "Trait" ] = trait.properties.construct;
			delete trait.properties.construct;
		}
	}

	/**
	 * Embeds a new context into the type's prototype.
	 * 
	 * @param {Object} context
	 * @return {this}
	 */
	this.prototype = function( context )
	{
		this.extendPrototype( context );

		if( this.parent )
		{
			this.inherit( this.parent.constructor.prototype );
		}
		
		this.renameTraitMethods();
		this.upgradePrototype();

		return this;
	}

	this.extendPrototype = function( context )
	{
		Object.assign( this.constructor.prototype, context );
		return this;
	}

	this.renameTraitMethods = function()
	{
		var AS;
		var proto = this.constructor.prototype;

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
	 * Creates and returns an object from the type.
	 * 
	 * @return {Object}
	 */
	this.new = function()
	{
		var instance = new this.constructor;

		this.callTraitInitializers( instance );
		this.igniteConstructMethod( instance, arguments );
		
		return instance;
	}

	this.inherit = function( context )
	{
		var target = this.constructor.prototype;

		for( var prop in context )
		{
			if( prop in target )
			{
				continue;
			}
			
			target[ prop ] = context[ prop ];
		}
	}

	this.callTraitInitializers = function( instance )
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

	this.igniteConstructMethod = function( instance, initialArgs )
	{
		if( instance.construct instanceof Function )
		{
			instance.construct.apply(
				instance,
				Array.prototype.slice.call( initialArgs )
			);
		}
	}

	/**
	 * Instantiates and returns the constructor method of the represented
	 * type with the given parameters. Its difference from the new method
	 * is that it always returns the same instance instead of producing a
	 * new instance every time it is run.
	 * 
	 * @return {Object}
	 */
	this.singleton = function()
	{
		return this.instance ||
			( this.instance = this.new.apply( this, Array.prototype.slice.call( arguments )));
	}

	this.upgradePrototype = function()
	{
		this.extendPrototype(
		{
			type: this,
			is: this.is,
			behave: this.behave,
			super: this.super
		});
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
		var context = this instanceof type
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
		var arg = Array.prototype.slice.call( arguments );

		if(
			arg.length == 2 &&
			typeof( arg[ 0 ]) == "string" &&
			Object.prototype.toString.call( arg[ 1 ]) == "[object Array]"
		)
		{
			method = arg.shift();
			arg = arg.shift();
		}
		else if( arg.length == 1 && typeof( arg[ 0 ]) == "string" )
		{
			method = arg.shift();
		}
		
		return context[ method ].apply( this, arg );
	}
}
