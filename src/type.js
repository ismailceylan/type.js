import Interface from "./interface/index.js";
import { closured, rename, typeName, getPrototypeOf, setPrototypeOf }
	from "./utils/index.js";

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
	 * List of executed interfaces over this type.
	 * 
	 * @private
	 * @type {Array}
	 */
	const coveredInterfaces = [];

	/**
	 * The key name of the object that holds original
	 * values of the proxified properties by interfaces.
	 * 
	 * @private
	 * @type {String}
	 */
	const PROXY_KEY = Type.PROXY_KEY = "__proxifiedProperties__";
	
	/**
	 * The prefix key for the proxyfied properties by
	 * interfaces.
	 * 
	 * @private
	 * @type {String}
	 */
	const PROXY_PROP_PREFIX = Type.PROXY_PROP_PREFIX = "$proxified_";

	/**
	 * Type name.
	 * 
	 * @type {String}
	 */
	this.name = name;

	/**
	 * Parent type.
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
	 * Implemented interface list.
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
	 * Abstract flag of the type.
	 * 
	 * @type {Boolean}
	 */
	this.isAbstract = false;

	/**
	 * Holds the definitions enforced by the implemented
	 * interfaces. Child types will forced to define them.
	 * 
	 * @type {Object}
	 */
	this.missedMethods = {}

	/**
	 * Holds the definitions enforced by the implemented
	 * interfaces. Child types will forced to define them.
	 * 
	 * @type {Object}
	 */
	this.missedProperties = {}

	/**
	 * Properties of the type.
	 * 
	 * @type {Object}
	 */
	this.properties = {}

	/**
	 * Marks represented type as abstract.
	 */
	this.abstract = function()
	{
		this.isAbstract = true;
		return this;
	}

	/**
	 * Mixes a new context into the type's prototype.
	 * 
	 * @param {Object} context
	 * @return {this}
	 */
	this.prototype = function( context )
	{
		for( const key in context )
		{
			const value = context[ key ];

			this[ value instanceof Function? "methods" : "properties" ][ key ] = value;
		}

		if( arguments[ 1 ] === undefined )
		{
			for( const iface of this.interfaces )
			{
				if( coveredInterfaces.includes( iface.name ))
				{
					continue;
				}

				coveredInterfaces.push( iface.name );
				iface.apply( this );
			}

			const missedProperties = this.getInheritedMissedProperties();
			const missedMethods = this.getInheritedMissedMethods();

			for( const key in missedProperties )
			{
				missedProperties[ key ]( this );
			}

			for( const key in missedMethods )
			{
				missedMethods[ key ]( this );
			}
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
		this.types = [ ...this.types, ... parent.types ];
		this.traits = [ ...this.traits, ...parent.traits ];

		return this;
	}

	/**
	 * Adds interfaces to implement list.
	 * 
	 * @param {Array<Interface>} interfaces
	 * @returns {this}
	 */
	this.implements = function( ...interfaces )
	{
		this.interfaces = interfaces;

		return this;
	}

	/**
	 * Copies the properties of the given trait(s) into the properties
	 * of this type. Props are copied to the prototype of the constructor of
	 * this type, that is, the copied props appear as if they were props of
	 * this type.
	 * 
	 * @param {Trait} trait the trait to use
	 * @param {Object} renameMap {target: "newName"} formatted renaming map
	 * @return {Type}
	 */
	this.use = function( trait, renameMap )
	{
		this.prototype(
			renameMap
				? rename( trait.properties, renameMap, true )
				: trait.properties,
			false
		);

		this.traits = [ ...this.traits, ...trait.traits ];

		return this;
	}

	/**
	 * Creates and returns an object from the type.
	 * 
	 * @return {Object}
	 */
	this.create = function()
	{
		const type = this;
		const instance = new this.constructor;
		const inheritedProperties = this.getInheritedProperties();
		let proto;

		Object.defineProperties(
			instance,
			Object.getOwnPropertyDescriptors( inheritedProperties )
		);

		if( this.parent )
		{
			let currentType = this;
			
			proto = setPrototypeOf( instance, {});

			while( currentType )
			{
				defineTypeMember( proto, "constructor", currentType.constructor );

				for( const name in currentType.methods )
				{
					defineTypeMember(
						proto,
						name,
						bindMagicalParentWord(
							this,
							currentType,
							name,
							instance,
							proto
						)
					);
				}

				if( ! currentType.parent )
				{
					break;
				}
				
				// making ready one level deeper area in the proto chain
				proto = setPrototypeOf( proto, {});
				currentType = currentType.parent;
			}
		}

		for( const key in this.methods )
		{
			getPrototypeOf( instance )[ key ] = bindMagicalParentWord(
				this,
				this,
				key,
				instance,
				instance
			);
		}

		proto = setPrototypeOf( proto, {});

		for( const key in instance )
		{
			if( key.startsWith( PROXY_PROP_PREFIX ))
			{
				const unprefixedKey = key.replace( PROXY_PROP_PREFIX, "" );

				if( ! ( PROXY_KEY in proto ))
				{
					defineTypeMember( proto, PROXY_KEY, {});
				}

				proto[ PROXY_KEY ][ unprefixedKey ] = instance[ key ];
				delete instance[ key ];
			}
		}

		defineTypeMember( proto, "is", target =>
			type.is( target, true )
		);

		defineTypeMember( proto, "behave", targetTrait =>
			type.behave( targetTrait )
		);

		defineTypeMember( proto, "constructor", Type );

		if( "construct" in instance )
		{
			instance.construct.call( instance, ...arguments );
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
	this.getInheritedProperties = function()
	{
		const stack = {}

		if( this.parent )
		{
			Object.defineProperties(
				stack,
				Object.getOwnPropertyDescriptors( this.parent.getInheritedProperties())
			);
		}

		Object.defineProperties(
			stack,
			Object.getOwnPropertyDescriptors( this.properties )
		);

		return stack;
	}

	/**
	 * It collects and returns the methods of its own and all
	 * parent types in a chained manner. The method of the last
	 * defined type overrides the methods of the parent type.
	 * 
	 * @returns {Object}
	 */
	this.getInheritedMethods = function()
	{
		const stack = {}
		let current = this;

		while( current )
		{
			for( const methodName in current.methods )
			{
				stack[ methodName ] = current.methods[ methodName ];
			}

			current = current.parent;
		}

		return stack;
	}

	/**
	 * Returns all the missed properties that required by
	 * interfaces in inherited manner.
	 *  
	 * @returns {Object}
	 */
	this.getInheritedMissedProperties = function()
	{
		const stack = {}
		let current = this;

		while( current )
		{
			for( const methodName in current.missedProperties )
			{
				stack[ methodName ] = current.missedProperties[ methodName ];
			}

			current = current.parent;
		}

		return stack;
	}

	/**
	 * Returns all the missed methods that required by
	 * interfaces in inherited manner.
	 *  
	 * @returns {Object}
	 */
	this.getInheritedMissedMethods = function()
	{
		const stack = {}
		let current = this;

		while( current )
		{
			for( const methodName in current.missedMethods )
			{
				stack[ methodName ] = current.missedMethods[ methodName ];
			}

			current = current.parent;
		}

		return stack;
	}

	/**
	 * Returns whether this type or parent at any level ever uses
	 * the given trait or not.
	 * 
	 * @param {Trait} targetTrait a trait to test
	 * @returns {Boolean}
	 */
	this.behave = function( targetTrait )
	{
		return this.traits.includes( targetTrait.name );
	}

	/**
	 * Returns whether this type or parent type at any level ever
	 * extends the given type or implements the given interface.
	 * 
	 * @param {Type|Interface} target a type or interface to test
	 * @param {*} fromInstance 
	 * @returns {Boolean}
	 */
	this.is = function( target, fromInstance )
	{
		if( target instanceof Type )
		{
			return this.types.includes( target.name );
		}
		else if( target instanceof Interface )
		{
			let isNameInInterfaces = false;
			let currentType = this;

			inheritanceLoop: while( currentType )
			{
				for( const iface of currentType.interfaces )
				{
					if( iface.is( target ))
					{
						isNameInInterfaces = true;
						break inheritanceLoop;
					}
				}

				currentType = currentType.parent;
			}

			return isNameInInterfaces;
		}
		else if( ! fromInstance )
		{
			while( target = getPrototypeOf( target ))
			{
				if( Object.is( target.constructor, this.constructor ))
				{
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Tests given target is extended or implemented by
	 * this type. It's also a trap for instanceof scenarios.
	 * 
	 * @param {Type|Interface} target 
	 * @returns {Boolean}
	 */
	this[ Symbol.hasInstance ] = function( target )
	{
		return target.is( this );
	}
}

function parentalAccess( type, currentType, callerMethodName, root, proto, methodName, args )
{
	if(( type = type.parent ) === null )
	{
		throw new ReferenceError(
			"The " + currentType.name + " is a type that does not extend another " +
			"type, the parent method cannot be used in the " + callerMethodName +
			" method."
		);
	}

	let ctx = getPrototypeOf( proto );

	// if root object is same with the proto
	// that we should work on it then first
	// level [[Prototype]] will lead infinite loop
	if( root === proto )
	{
		// we have to dive one level deeper
		ctx = getPrototypeOf( ctx );
		type = type.parent;
	}

	if( methodName === undefined )
	{
		methodName = callerMethodName;
	}

	if( methodName in ctx )
	{
		return ctx[ methodName ].apply( root, args );
	}
	else if( getPrototypeOf( ctx ) === null )
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
			"The parent method used in " + currentType.name + "." + callerMethodName +
			" tried to access method " + methodName + ", which is not defined in type " +
			currentType.parent.name + "!"
		);
	}
}

function bindMagicalParentWord( finalType, currentType, callerMethodName, root, proto )
{
	const filename = currentType.name + "." + callerMethodName;
	const method = currentType.methods[ callerMethodName ];
	const scope =
	{
		...method.dependencies,

		parent: ( methodName, args ) =>
		{
			if( typeName( methodName ) == "Array" )
			{
				args = methodName;
				methodName = undefined;
			}

			return parentalAccess( finalType, currentType, callerMethodName, root, proto, methodName, args );
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
