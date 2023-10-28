/**
 * Trait oluşturur.
 * @param {String} name trait adı
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
	 * Trait'in adı.
	 * @type {String}
	 */
	this.name = name[ 0 ].toUpperCase() + name.slice( 1 );

	/**
	 * Bu trait'in kendi trait'i de dahil sahip olduğu trait'leri tutar.
	 * @type {Array}
	 */
	this.types = [ this.name ];

	/**
	 * Trait'in kendininki ve miras aldığı trait'lerdeki metot ve özellikler.
	 * @type {Object}
	 */
	this.properties = {}

	/**
	 * Verilen üstel trait'(ler)in özelliklerini bu trait'in özellikleri arasına
	 * kopyalar, miras alır.
	 * 
	 * @param {Trait} ...parents özellikleri miras alınacak ebeveyn trait(ler)
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
	 * Verilen nesnedeki özellikleri trait'in prototype yığınına ekler.
	 * 
	 * @param {Object} context trait'in metot ve özelliklerini içeren bir nesne
	 * @return {this}
	 */
	this.prototype = function( context )
	{
		Object.assign( this.properties, context );
		return this;
	}

	/**
	 * Temsil edilen trait'in verilen türü miras alıp almadığını söyler.
	 * 
	 * @param {Trait} target sınanacak bir trait
	 * @return {Boolean}
	 */
	this.is = function( target )
	{
		return this.types.indexOf( target.name ) > -1;
	}
}
