import { rename } from "./utils/index.js";

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

	if( typeof( name ) !== "string" || /^[a-z_$]{1}[a-z0-9_$]*$/i.test( name ) === false )
	{
		throw TypeError( "The first argument must be a valid trait name." );
	}

	/**
	 * Trait name.
	 * 
	 * @type {String}
	 */
	this.name = name[ 0 ].toUpperCase() + name.slice( 1 );

	/**
	 * It keeps the traits list that this trait has, including itself.
	 * 
	 * @type {Array}
	 */
	this.traits = [ this.name ];

	/**
	 * Methods and properties in the trait's own and inherited traits.
	 * @type {Object}
	 */
	this.properties = {}

	/**
	 * It copies the properties of the given parent trait(s) into
	 * the properties of this trait. Inherits it.
	 * 
	 * @param {Trait} ...parents traits to use
	 * @return {this}
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
	 * Adds properties from the given object to the trait's
	 * prototype stack.
	 * 
	 * @param {Object} context an object containing methods and properties
	 * @return {this}
	 */
	this.prototype = function( context )
	{
		Object.assign( this.properties, context );
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
		return this.traits.indexOf( target.name ) > -1;
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
