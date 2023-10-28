/**
 * Creates traits.
 * 
 * @param {String} name trait name
 */
export default function trait( name )
{
	if( ! ( this instanceof trait ))
	{
		return new trait( name );
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
	this.types = [ this.name ];

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
	this.use = function( parents )
	{
		Array.prototype.slice
			.call( arguments )
			.forEach( parent =>
			{
				Object.assign( this.properties, parent.properties );
				this.types = this.types.concat( parent.types );
			});

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
	 * Tells whether the represented type inherits a given type.
	 * 
	 * @param {Trait} target a trait name or a trait to check
	 * @return {Boolean}
	 */
	this.is = function( target )
	{
		return this.types.indexOf( target.name ) > -1;
	}
}
