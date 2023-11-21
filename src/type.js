import { args, closured, rename } from "./utils/index.js";

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
	 * Type name.
	 * 
	 * @type {String}
	 */
	this.name = name;

	/**
	 * The parent type from which this type inherited.
	 * 
	 * @type {Type}
	 */
	this.parent = null;

	/**
	 * List of inherited type names.
	 * 
	 * @type {Array}
	 */
	this.types = [ name ];

	/**
	 * List of inherited trait names.
	 * 
	 * @type {Array}
	 */
	this.traits = [];

	/**
	 * Implemented interfaces list.
	 * 
	 * @type {Array}
	 */
	this.interfaces = [];

	/**
	 * Constructor method to represent the type natively.
	 * 
	 * @type {Function}
	 */
	this.constructor = eval( "( function " + name + "(){})" );

	/**
	 * Methods of the type.
	 * 
	 * @type {Object}
	 */
	this.methods = {}

	/**
	 * Properties of the type.
	 * 
	 * @type {Object}
	 */
	this.properties = {}

	/**
	 * Embeds a new context into the type's prototype.
	 * 
	 * @param {Object} context
	 * @return {this}
	 */
	this.prototype = function( context )
	{
		for( var key in context )
		{
			var value = context[ key ];

			this[ value instanceof Function? "methods" : "properties" ][ key ] = value;
		}

		for( var iface of this.interfaces )
		{
			iface.apply( this );
		}

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
		this.traits = this.traits.concat( parent.traits );
		
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
		this.interfaces = args( arguments );

		return this;
	}

	/**
	 * Copies the properties of the given trait(s) into the properties
	 * of this type. Props are copied to the prototype of the constructor of
	 * this type, that is, the copied props appear as if they were props of
	 * this type.
	 * 
	 * @param {Array} ...parents traits to use
	 * @return {Type}
	 */
	this.use = function( trait, renameMap )
	{
		this.prototype(
			renameMap
				? rename( trait.properties, renameMap, true )
				: trait.properties
		);

		this.traits = this.traits.concat( trait.types );

		return this;
	}

	/**
	 * Creates and returns an object from the type.
	 * 
	 * @return {Object}
	 */
	this.create = function()
	{
		var instance = new this.constructor;

		Object.defineProperties(
			instance,
			Object.getOwnPropertyDescriptors( this.getProperties())
		);

		if( this.parent )
		{
			var currentType = this;
			var proto = instance.__proto__ = {};

			while( currentType )
			{
				defineTypeMember( proto, "constructor", currentType.constructor );

				for( var name in currentType.methods )
				{
					defineTypeMember(
						proto,
						name,
						bindMagicalParentWord(
							this,
							currentType,
							name,
							currentType.methods[ name ],
							instance,
							proto
						)
					);
				}

				if( currentType.parent )
				{
					proto = proto.__proto__ = {}
					currentType = currentType.parent;
				}
				else
				{
					break;
				}
			}
		}

		for( var key in this.methods )
		{
			instance.__proto__[ key ] = bindMagicalParentWord(
				this,
				this,
				key,
				this.methods[ key ],
				instance,
				instance
			);
		}

		if( "construct" in instance )
		{
			instance.construct.apply( instance, args( arguments ));
		}

		return instance;
	}

	/**
	 * It collects and returns the properties of its own and all
	 * parent types in a chained manner. The property of the last
	 * defined type overrides the properties of the parent type.
	 * 
	 * @returns {Object}
	 */
	this.getProperties = function()
	{
		var stack = {}

		if( this.parent )
		{
			Object.defineProperties(
				stack,
				Object.getOwnPropertyDescriptors( this.parent.getProperties())
			);
		}

		Object.defineProperties(
			stack,
			Object.getOwnPropertyDescriptors( this.properties )
		);

		return stack;
	}
}

function parentalAccess( type, callerMethodName, root, proto, methodName, args )
{
	var ctx = proto.__proto__;

	type = type.parent;

	// if root object is same with the proto
	// that we should work on it then first
	// level __proto__ will lead infinite loop
	if( root === proto )
	{
		// we have to dive one level deeper
		ctx = ctx.__proto__;
		type = type.parent;
	}

	if( methodName in ctx )
	{
		return ctx[ methodName ].apply( root, args );
	}
	else if( ctx.__proto__ === null )
	{
		throw new ReferenceError(
			'"parent" method was used illegally in ' +
			type.parent.name + "." + callerMethodName + " method. " +
			"Within the root types, using parent method is ineffective."
		);
	}
	else
	{
		throw new ReferenceError(
			"The parent method used in " + type.name + "::" + callerMethodName +
			"() tried to access method "+ methodName +", which is not defined in type " +
			type.parent.name + "!"
		);
	}
}

function bindMagicalParentWord( finalType, currentType, callerMethodName, method, root, proto )
{
	var filename = currentType.name + "." + callerMethodName;
	var scope =
	{
		parent: function( methodName, args )
		{
			return parentalAccess( finalType, callerMethodName, root, proto, methodName, args );
		}
	}

	if( method.dependencies )
	{
		for( var key in method.dependencies )
		{
			scope[ key ] = method.dependencies[ key ];
		}
	}

	return closured( method, scope, filename );
}

function defineTypeMember( obj, name, value )
{
	Object.defineProperty( obj, name,
	{
		value: value,
		writable: true,
		configurable: true,
		enumerable: false
	});
}
