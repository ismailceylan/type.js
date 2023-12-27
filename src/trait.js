import { rename, setTag } from "./utils/index.js";

/**
 * Creates traits.
 * 
 * @param {String} name trait name
 */
export default function Trait( name )
{
	if( ! ( this instanceof Trait ))
	{
		return new Trait( name );
	}

	/**
	 * Trait name.
	 * 
	 * @type {String}
	 */
	this.name = setTag( this, name );

	/**
	 * It keeps the traits list that this trait has, including itself.
	 * 
	 * @type {Array}
	 */
	this.traits = [ this.name ];

	/**
	 * Methods and properties in the trait's own and inherited traits.
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
	 * It copies the properties of the given parent trait(s) into
	 * the properties of this trait. Inherits it.
	 * 
	 * @param {Trait} ...parents traits to use
	 * @return {this}
	 */
	this.uses = function( trait, renameMap )
	{
		this.body(
			renameMap
				? rename( trait.properties, renameMap, true )
				: trait.properties
		);

		this.traits = [ ...this.traits, ...trait.traits ];

		Object.assign( this.dependencies, trait.dependencies );

		return this;
	}

	/**
	 * Adds properties from the given object to the trait's
	 * properties stack.
	 * 
	 * @param {Object} context an object containing methods and properties
	 * @return {this}
	 */
	this.body = function( context )
	{
		Object.assign( this.properties, context );
		return this;
	}

	/**
	 * Appends to the dependencies list.
	 * 
	 * @param {Object} dependencies dependencies to add dependencies list
	 * @return {Trait}
	 */
	this.inject = function( dependencies )
	{
		Object.assign( this.dependencies, dependencies );
		return this;
	}

	/**
	 * Tells whether the represented trait extends a given trait.
	 * 
	 * @param {Trait} target a trait to check if it is extended
	 * @return {Boolean}
	 */
	this.behave = function( target )
	{
		return this.traits.includes( target.name );
	}

	/**
	 * Tests given target trait is used by this trait. It's
	 * also a trap for instanceof scenarios.
	 * 
	 * @param {Trait} target 
	 * @returns {Boolean}
	 */
	this[ Symbol.hasInstance ] = function( target )
	{
		return target.behave( this );
	}
}
