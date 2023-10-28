/**
 * Tür oluşturur.
 * @param {String} name tür adı
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
	 * Türün adı.
	 * @type {String}
	 */
	this.name = name[ 0 ].toUpperCase() + name.slice( 1 );

	/**
	 * Bu türün kendi türü de dahil sahip olduğu türleri tutar.
	 * @type {Array}
	 */
	this.types = [ this.name ];

	/**
	 * Bu türün miras aldığı trait isimlerini tutar.
	 * @type {Array}
	 */
	this.behaviours = [];

	/**
	 * Bu türün miras aldığı ebeveyn tür.
	 * @type {Type}
	 */
	this.parent = null;

	/**
	 * Bu türden singleton yoluyla üretilen ilk instance.
	 * @type {Object}
	 */
	this.instance = null;

	/**
	 * Türü native olarak temsil edecek kurucu metot.
	 * @type {Function}
	 */
	this.constructor = eval( "( function " + this.name + "(){})" );

	/**
	 * Verilen trait'(ler)in özelliklerini bu türün özellikleri arasına
	 * kopyalar. Özellikler bu türün kurucusunun prototype'ına kopyalanır
	 * yani kopyalanan özellikler sanki bu türün birer özelliğiymiş gibi görünür.
	 * 
	 * @param {Trait} ...parents özellikleri miras alınacak trait(ler)
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

	/**
	 * Verilen trait'in özellikleri arasındaki construct metodunu benzersiz
	 * bir isimle değiştirir. Böylece türlere ait construct metotları ile
	 * çakışmaların önüne geçilir.
	 * 
	 * @param {Trait} trait bir trait
	 */
	this.renameTraitConstructMethod = function( trait )
	{
		if( trait.properties.construct )
		{
			trait.properties[ "construct" + trait.name + "Trait" ] = trait.properties.construct;
			delete trait.properties.construct;
		}
	}

	/**
	 * Tür prototype'ını oluşturur.
	 * 
	 * @param {Object} context türün metot ve özelliklerini içeren bir nesne
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

	/**
	 * Verilen nesnedeki özellikleri türün prototype yığınına ekler.
	 * 
	 * @param {Object} context metot ve özellikler içeren bir nesne
	 * @return {this}
	 */
	this.extendPrototype = function( context )
	{
		Object.assign( this.constructor.prototype, context );
		return this;
	}

	/**
	 * Temsil edilen türün miras aldığı trait'lerde bulunan metotlar,
	 * tür prototype'ı tanımlanırken yeniden isimlendirilmiş olabilir.
	 * Bunları uygular.
	 */
	this.renameTraitMethods = function()
	{
		var AS;
		var proto = this.constructor.prototype;

		// kurucu prototype'ında AS isimli bir property yoksa işlem yok
		if( ! ( AS = proto.AS ))
		{
			return;
		}
		
		for( var oldMethodName in AS )
		{
			proto[ AS[ oldMethodName ]] = proto[ oldMethodName ];
			delete proto[ oldMethodName ];
		}

		// rename işlemleri bitti map eden
		// nesnenin orada olmasına gerek yok artık
		delete proto.AS;
	}

	/**
	 * Verilen üstel türün özelliklerini bu türün özellikleri arasına
	 * kopyalar, miras alır.
	 * 
	 * @param {Type} parent özellikleri miras alınacak ebeveyn tür
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
	 * Temsil edilen türün kurucu metodunu verilen parametrelerle
	 * örnekleyip döndürür.
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

	/**
	 * Verilen nesne içindeki property'ler bu türün
	 * prototype'ında yoksa buraya yerleştirilir. Tür
	 * o property'e sahipse bunu kullanmaya devam eder.
	 * 
	 * @param {Object} context miras alınacakları içeren bir nesne
	 */
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

	/**
	 * Verilen nesnenin miras aldığı davranışların kendi iç işlerini
	 * ilgilendiren kurucu metotları varsa bunları çalıştırır.
	 * 
	 * @param {Object} instance bir tür
	 */
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

	/**
	 * Verilen nesne üzerinde construct adında bir metot varsa buna
	 * verilen arguments nesnesindeki argümanları geçirerek çalıştırır.
	 * Metot kendi etki alanında çalışır yani construct metodunun
	 * içinde kullanlacak this sözcüğü o metodun içinde bulunduğu türe
	 * refere eder.
	 * 
	 * @param {Object} instance bir nesne
	 * @param {Arguments} initialArgs kurulum anındaki argüman listesi
	 */
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
	 * Temsil edilen türün kurucu metodunu verilen parametrelerle
	 * örnekleyip döndürür. new metodundan farkı her çalıştırıldığında
	 * yeni bir instance üretmek yerine hep aynı instance'ı döndürür.
	 * 
	 * @return {Object}
	 */
	this.singleton = function()
	{
		return this.instance ||
			( this.instance = this.new.apply( this, Array.prototype.slice.call( arguments )));
	}

	/**
	 * Temsil edilen türün prototype'ına gerekli özellikleri yerleştirir.
	 */
	this.upgradePrototype = function()
	{
		this.extendPrototype(
		{
			// bu kurucuyu oluşturan tür arayüzüne
			// instance'lar üzerinden ulaşabilelim
			type: this,

			// instance'lar üzerinde tür sınama metodu bulunsun
			// bu metot instanceof işleyişinin yerini alacak
			is: this.is,

			// instance'lar üzerinde davranış sınama metodu bulunsun
			behave: this.behave,

			// super metodu bulunsun
			super: this.super
		});
	}

	/**
	 * Temsil edilen türün verilen türü miras alıp almadığını söyler.
	 * 
	 * @param {Type} target sınanacak bir tür veya tür adı
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
	 * Temsil edilen türün verilen trait'i miras alıp almadığını söyler.
	 * 
	 * @param {Trait|String} target sınanacak bir trait veya trait adı
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
	 * Temsil edilen türün ebeveyn türüne erişimi sağlar.
	 *
	 * - Ebeveynin belli bir metodunu call etmek
	 * (String, [...Array])
	 *
	 * - Ebeveynin construct metodunu call etmek
	 * (...Params)
	 *
	 * - Ebeneynin bağlamına erişmek
	 * ()
	 * 
	 * @return {mixed}
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

		// parent bağlamına erişim
		if( arguments.length == 0 )
		{
			return context;
		}
		
		// varsayacağımız metot adı construct olacak
		var method = "construct";
		// parametrelere dizi olarak ihtiyacımız var
		var arg = Array.prototype.slice.call( arguments );

		// adı verilmiş bir metot call edilecek
		if(
			arg.length == 2 &&
			typeof( arg[ 0 ]) == "string" &&
			Object.prototype.toString.call( arg[ 1 ]) == "[object Array]"
		)
		{
			// ilk parametre metot adı
			method = arg.shift();
			arg = arg.shift();
		}
		else if( arg.length == 1 && typeof( arg[ 0 ]) == "string" )
		{
			method = arg.shift();
		}
		
		// metot adı ve parametreler elimizde, call edelim
		return context[ method ].apply( this, arg );
	}
}
