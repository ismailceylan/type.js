**This javascript library allows define types and traits. An identified type can be inherited
by other types. Defined traits can also be used by types.**

**This library uses the prototype mechanism.**

_Bu javascript kütüphanesi türler ve davranışlar tanımlamanızı sağlar. Tanımlanan bir tür başka
türler tarafından miras alınabilir. Tanımlanan davranışlar da türler tarafından kullanılabilir._

_Bu kütüphane özünde prototype mekanizmasını kullanır._

## Usage (Örnek Kullanım)
### Let's create some traits specific to living things (Canlılara özgü bazı davranışlar oluşturalım)
```javascript
var Breathable = Trait( "Breathable" ).prototype(
{
    breath: function()
    {
        console.log( "Yay! I can breath." );
    }
});
```
**Traits are added to the prototype area of the types that use it. Therefore, the instance scope
(this word) refers to the type to which they belong**

_Davranışlar, onu kullanan türlerin prototype alanına eklenirler. Dolayısıyla etki alanı
(this sözcüğü) ait oldukları türdür._

### Implementing Types (Tür oluşturma)
```javascript
var Creature = Type( "Creature" ).use( Breathing ).prototype(
{
    construct: function()
    {
        console.log( "Yay! I'm alive." );
    }
    
    live: function()
    {
        console.log( "Since I'm alive, why can't I live?" );
    }
});
```
**The `construct` method performs the constructive operations of the type. Each time
created an instance from a type, it runs once, taking the given parameters. In this
method, we can perform the installation procedures and provide the necessary values
to the features we need to initialize.**

_`construct` metodu, oluşturulan türün kurucu metodudur. Bir tür her örneklendiğinde
verilen parametreleri alarak bir defa çalışır. Bu metot içinde kurulumsal işlemleri
yapabilir ilklendirmemiz gereken özelliklere gerekli değerleri sağlayabiliriz._

### Let's create intermediate type (Ara tür oluşturalım)
```javascript
var Animal = Type( "Animal" ).extends( Creature ).prototype(
{
    construct: function()
    {
        // first, let the creature's constructor work
        // önce Creature türünün kurucusu çalışsın
        this.super( "construct" );
        
        // now, the actions concerning the Animal type can work
        // şimdi hayvan türünü ilgilendiren işlemler çalışsın
        console.log( "I'm not a veggy, there is an animal inside of me" );
    }
});
```
### Let's create some humanly traits (İnsanlara özgü bazı davranışlar oluşturalım)
```javascript
var Speakable = Trait( "Speakable" ).prototype(
{
    speak: function( words )
    {
        console.log( "I'm talking!", words );
    }
});
```

**The trait can also define the 'construct' method. This method will also work on
the instance of the Type that uses the trait. It provides a useful space for
performing primitive actions related to trait. So it is not necessary to create
pollution within the constructor of the Type.**

_Davranış (trait) da `construct` metodu tanımlayabilir. Bu metot da yine davranışı
kullanan türün etki alanında çalışacaktır. Davranışa ilişkin ilksel işlemleri
gerçekleştirmek için kullanışlı bir alan sağlar. Türün kurucusu içinde kirlilik
oluşturmak gerekmez._

### Let's create a new and powerful type (Yeni ve güçlü bir tür oluşturalım)
```javascript
var Human = Type( "Human" ).extends( Animal ).use( Speakable ).prototype(
{
    AS:
    {
        // we can rename the method "speak" taken from
        // the trait named "Speakable" as "talk"
        // -----------------
        // "Speakable" isimli trait üzerinden alınan "speak" isimli
        // metodu "talk" adıyla yeniden isimlendirebiliriz
        speak: "talk"
    },
    
    construct: function( name )
    {
        // first, let's run animal's constructor
        // önce Hayvan türünün kurucusu çalıştırılsın
        this.super( "construct" );

        // now, we can initialize the Human
        // artık Insan türünün kurulumsal işlemlerini yapabiliriz
        console.log( "And my name is " + name );
        
        // it should breath immediately otherwise it may die just now
        // hemen nefes almaya başlasın yoksa ölür :|
        this.breath();
        // it should speak just now or it may still die
        // hemen konuşmaya başlasın yoksa yine ölür keh keh :P
        this.talk( "Those are my first words." );
    }
    
    live: function()
    {
        // this method has been inherited from the "creature" type up to this point, but
        // we have defined the "live" method here again, so we rejected the inheritance, but
        // I want to add something on developing this heritage, not to refuse it.
        // ------------------
        // Bu metot taa canlı türünden bu noktaya kadar miras yoluyla geldi
        // ancak biz burada tekrar metodu tanımladık dolayısıyla mirası reddettik
        // ama reddetmek değil, bu mirası geliştirmek üzerine bir şeyler katmak istiyorum
        this.super( "live" );
        
        // now we can improve our heritage.
        // şimdi genişleme işlemlerini yapabilirim
        console.log( "I live like a human!" );
    }
});
```

**The `super` method provides access to the inherited type.**

_`super` metodu miras alınan türe erişimi sağlar._

##### Calling a particular method of the parent (Ebeveynin bir metodunu çalıştırmak)
super(String, [...Array])

##### Calling the construct method of the parent (Ebeveynin construct metodunu çalıştırmak)
super(...Params)

##### Accessing the parent context (Ebeveyn bağlamına erişmek)
super()

### Let's create instances from types (Türü örnekleyelim)
```javascript
var ismail = Human.new( "İsmail" );

    ismail.live();
    ismail.talk( "Hello world!" );
```

### Testing "Is A" relations (Tür sınama)
```javascript
// please remember that the "ismail" object does not directly extends
// the "Creature" type. It extends the "Animal" intermediate type.
// --------------
// ismail'in Canli türünü direkt extends etmediğini
// hatırlayın Hayvan ara türünü extends etmiştik
ismail.is( Creature );
// true

ismail.behave( Breathable );
// true
```

### Creating singleton object from types (Singleton örnekleme)
```javascript
// ## app.js
var somebody = Human.singleton( "Donald" );
    somebody.lastName = "Trump";

// ## same runtime (aynı runtime)
// ## islem.js
Human.singleton().lastName;
// Trump
```
### Accessing type related meta datas from instances (Instance üzerinden türsel meta bilgilere erişmek)
```javascript
var janedoe = Human.new( "Jane Doe" );

    janedoe.type.name;
    // Human
    
    janedoe.type.behaviours;
    // [ "Breathable", "Speakable" ]
    
    janedoe.type.types;
    // [ "Human", "Animal", "Creature" ]
```
