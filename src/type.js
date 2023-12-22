import Interface from "./interface/index.js";
import { args, closured, rename, typeName, getPrototypeOf, setPrototypeOf }
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
	var coveredInterfaces = [];

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
	 * Properties of the type.
	 * 
	 * @type {Object}
	 */
	this.properties = {}

	/**
	 * Mixes a new context into the type's prototype.
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

		if( arguments[ 1 ] === undefined )
		{
			for( var iface of this.interfaces )
			{
				if( coveredInterfaces.indexOf( iface.name ) > -1 )
				{
					continue;
				}

				coveredInterfaces.push( iface.name );
				iface.apply( this );
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
	 * @param {Trait} trait the trait to use
	 * @param {Object} renameMap {target: "newName"} formatted renaming map
	 * @return {Type}
	 */
	this.use = function( trait, renameMap )
	{
		this.prototype(
			renameMap
				? rename( trait.properties, renameMap, true )
				: trait.properties
		);

		this.traits = this.traits.concat( trait.traits );

		return this;
	}

	/**
	 * Creates and returns an object from the type.
	 * 
	 * @return {Object}
	 */
	this.create = function()
	{
		var type = this;
		var instance = new this.constructor;
		var inheritedProperties = this.getInheritedProperties();

		Object.defineProperties(
			instance,
			Object.getOwnPropertyDescriptors( inheritedProperties )
		);

		if( this.parent )
		{
			var currentType = this;
			var proto = setPrototypeOf( instance, {});

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

		for( var key in this.methods )
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

		var proxyKey = "__proxifiedProperties__";

		for( var key in instance )
		{
			var prefix = key.substr( 0, 11 );

			if( prefix == "$proxified_" )
			{
				var unprefixedKey = key.replace( prefix, "" );

				if( ! ( proxyKey in proto ))
				{
					defineTypeMember( proto, proxyKey, {});
				}

				proto[ proxyKey ][ unprefixedKey ] = instance[ key ];
				delete instance[ key ];
			}
		}

		defineTypeMember( proto, "is", function( target )
		{
			return type.is( target, true );
		});

		defineTypeMember( proto, "behave", function( targetTrait )
		{
			return type.traits.indexOf( targetTrait.name ) > -1;
		});

		defineTypeMember( proto, "constructor", Type );

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
	this.getInheritedProperties = function()
	{
		var stack = {}

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

	this.behave = function( target )
	{
		return this.traits.indexOf( target.name ) > -1;
	}

	this.is = function( target, fromInstance )
	{
		if( target instanceof Type )
		{
			return this.types.indexOf( target.name ) > -1;
		}
		else if( target instanceof Interface )
		{
			var isNameInInterfaces = false;
			var currentType = this;

			inheritanceLoop: while( currentType )
			{
				for( var iface of currentType.interfaces )
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
				if( target.constructor === this.constructor )
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

	var ctx = getPrototypeOf( proto );

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
	var filename = currentType.name + "." + callerMethodName;
	var method = currentType.methods[ callerMethodName ];
	var scope =
	{
		parent: function( methodName, args )
		{
			if( typeName( methodName ) == "Array" )
			{
				args = methodName;
				methodName = undefined;
			}

			return parentalAccess( finalType, currentType, callerMethodName, root, proto, methodName, args );
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
