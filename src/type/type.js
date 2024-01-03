import Interface from "../interface/index.js";
import { bindMagicalParentWord } from "./utils/index.js";
import { 
	rename, getPrototypeOf, setPrototypeOf, defineProp, setTag,
	clone, each, walkParents, inherit, deepClone
} from "../utils/index.js";
import {
	add as watchDebts,
	unwatch as unwatchDebts,
	stop as stopWatchingAllDebts,
	handle as revalidateDebts
} from "../utils/queue.js";

export default function Type( name )
{
	if( ! ( this instanceof Type ))
	{
		return new Type( name );
	}

	/**
	 * Indicates whether the type body is defined or not.
	 * 
	 * @private
	 * @type {Boolean}
	 */
	let hasBodyDefined = false;

	/**
	 * Type name.
	 * 
	 * @type {String}
	 */
	this.name = setTag( this, name );

	/**
	 * Shadow constructor to represent the type natively.
	 * 
	 * @type {Function}
	 */
	this.constructor = (() =>
	{
		try
		{
			return ({ eval })[ "eval" ]( "( function " + encodeURIComponent( name ) + "(){})" )
		}
		catch
		{
			throw TypeError(
				"In order to create a type, you need to provide a valid value as a " + 
				"string in the first parameter, which can also be a function name: '" + name + "'"
			);
		}
	})();

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
	 * Interface validators for type properties.
	 * 
	 * @type {Object}
	 */
	this.propertyValidators = {}

	/**
	 * Properties of the type.
	 * 
	 * @type {Object}
	 */
	this.properties = {}

	/**
	 * Dependencies list to inject method closure.
	 * 
	 * @type {Object}
	 */
	this.dependencies = {}

	/**
	 * Appends dependencies to the injection list.
	 * 
	 * @param {Object} context dependencies to add injection list
	 * @returns {Type}
	 */
	this.inject = function( context )
	{
		Object.assign( this.dependencies, context );
		return this;
	}

	/**
	 * Marks represented type as abstract.
	 */
	this.abstract = function()
	{
		this.isAbstract = true;
		return this;
	}

	/**
	 * Mixes a new object into the type's properties.
	 * 
	 * @param {Object} context
	 * @return {this}
	 */
	this.body = function( context )
	{
		if( hasBodyDefined )
		{
			throw new SyntaxError(
				`${ this.name }.prototype() method shouldn't be called more than once.`
			);
		}

		extendBody.call( this, context );

		for( const iface of this.interfaces )
		{
			iface.apply( this );
		}

		unwatchDebts( this );
		revalidateDebts( this );

		hasBodyDefined = true;

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

		Object.assign( this.dependencies, parent.dependencies );

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
	this.uses = function( trait, renameMap )
	{
		extendBody.call(
			this,
			renameMap
				? rename( trait.properties, renameMap, true )
				: trait.properties
		);

		this.traits = [ ...this.traits, ...trait.traits ];

		Object.assign( this.dependencies, trait.dependencies );

		return this;
	}

	/**
	 * Creates and returns an object from the type.
	 * 
	 * @return {Object}
	 */
	this.create = function()
	{
		if( this.isAbstract )
		{
			stopWatchingAllDebts();
			throw new TypeError( `${ this.name } is an abstract type and cannot be instantiated.` );
		}

		const type = this;
		const instance = new this.constructor;
		let proto = setPrototypeOf( instance, {});

		clone( deepClone( this.getInheritedProperties()), instance );

		if( ! this.parent )
		{
			defineProp( proto, "constructor", this.constructor );
		}
		else
		{
			walkParents( this, "parent", currentType =>
			{
				defineProp( proto, "constructor", currentType.constructor );

				for( const name in currentType.methods )
				{
					defineProp( proto, name, bindMagicalParentWord(
						this,
						currentType,
						name,
						instance,
						proto
					));
				}

				// making ready one level deeper area in the proto chain
				proto = setPrototypeOf( proto, {});
			});
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

		if( ! this.parent )
		{
			// let's make ready deepest proto
			proto = setPrototypeOf( proto, {});
		}

		each( this.getInheritedPropValidators(), ( validate, key ) =>
		{
			let value = instance[ key ];

			Object.defineProperty( instance, key,
			{
				get: () => value,
				set( newVal )
				{
					validate( newVal );
					value = newVal;
				}
			});
		});

		defineProp( proto, "is", target =>
			type.is( target, true )
		);

		defineProp( proto, "behave", targetTrait =>
			type.behave( targetTrait )
		);

		defineProp( proto, Symbol.toStringTag, this.name );
		defineProp( proto, "constructor", Type );

		Object.seal( proto );

		// instance ready let's call construct method
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
			clone( this.parent.getInheritedProperties(), stack );
		}

		clone( this.properties, stack );

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
		return inherit( this, "parent", current =>
			current.methods
		);
	}

	/**
	 * Returns all the missed properties that required by
	 * interfaces in inherited manner.
	 *  
	 * @returns {Object}
	 */
	this.getInheritedMissedProperties = function()
	{
		return inherit( this, "parent", current =>
			current.missedProperties
		);
	}

	/**
	 * Returns all the missed methods that required by
	 * interfaces in inherited manner.
	 *  
	 * @returns {Object}
	 */
	this.getInheritedMissedMethods = function()
	{
		return inherit( this, "parent", current =>
			current.missedMethods
		);
	}

	/**
	 * Returns all the property validators that required by
	 * interfaces in inherited manner.
	 *  
	 * @returns {Object}
	 */
	this.getInheritedPropValidators = function()
	{
		return inherit( this, "parent", current =>
			current.propertyValidators
		);
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

	/**
	 * Distributes given object's properties to the type's
	 * method and props lists.
	 * 
	 * @private
	 * @param {Object} context an object to push type's prototype
	 */
	function extendBody( context )
	{
		each( context, ( value, key ) =>
			this
				[ value instanceof Function? "methods" : "properties" ]
				[ key ] = value
		);
	}

	watchDebts( this );
}
