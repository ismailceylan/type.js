Bu javascript kütüphanesi türler ve davranışlar tanımlamanızı sağlar. Tanımlanan bir tür başka
türler tarafından miras alınabilir. Tanımlanan davranışlar da türler tarafından kullanılabilir.

Bu kütüphane özünde prototype mekanizmasını kullanır.

# Örnek Kullanım
## Tür oluşturma
```javascript
var Canli = Type( "Canli" ).prototype(
{
    construct: function()
    {
        console.log( "Yaşasın! Hayattayım." );
    }
    
    yasa: function()
    {
        console.log( "Canlıyım, yaşıyorum!" );
    }
});
```

`construct` metodu oluşturulan türün kurucu metodudur. Bir türü örneklediğinizde verilen
parametreleri alarak bir defa çalışır. Bu metot içinde kurulumsal işlemleri yapabilir
ilklendirmemiz gereken özelliklere gerekli değerleri sağlayabiliriz.

## Bazı davranışlar oluşturalım
```javascript
var NefesAlma = Trait( "NefesAlma" ).prototype(
{
    nefesAl: function()
    {
        console.log( "Ohh! Nefes alabiliyorum." );
    }
});


var Konusma = Trait( "Konusma" ).prototype(
{
    konus: function( sozler )
    {
        console.log( "Konuşuyorum!", sozler );
    }
});
```

Davranışlar, onu kullanan türlerin prototype alanına eklenirler. Dolayısıyla etki alanı
(this sözcüğü) ait oldukları türdür.

Ayrıca davranışlar (trait) içinde de `construct` metodu tanımlayabilirsiniz. Bu metot da
yine davranışı kullanan türün etki alanında çalışacaktır. Davranışa ilişkin ilksel işlemleri
gerçekleştirmek için kullanışlı bir alan sağlar. Türün kurucusu içinde kirlilik oluşturmak
gerekmez.

## Yeni ve güçlü bir tür oluşturalım
```javascript
var Insan = Type( "Insan" ).extends( Canli ).use( NefesAlma, Konusma ).prototype(
{
    AS:
    {
        // Konusma isimli trait üzerinden alınan konus isimli
        // metodu konusmaYap şeklinde ismini değiştirebiliriz
        konus: "konusmaYap"
    },
    
    construct: function( isim )
    {
        this.super( "construct" );
        console.log( "Ve adım da " + isim );
        
        this.nefesAl();
        this.konus( "bunlar ilk sözlerim" );
    }
    
    yasa: function()
    {
        // canlı türündeki yasa isimli metodu burada sıfırdan tanımladık
        
        // bu metodu sıfırdan tanımlamak istemiyorum, genişletmek istiyorum
        this.super( "yasa" );
        
        // şimdi genişleme işlemlerini yapabilirim
        console.log( "İnsan gibi yaşıyorum!" );
    }
});
```

`super` metodu miras alınan türe erişimi sağlar.

* super[]                => Ebeveyn türü oluşturan prototype nesnesini verir, buradaki statik metotlara ve özelliklere erişilebilir.
* super["construct"]     => Ebeveny türün `construct` metodunu parametre olmadan çalıştırır.
* super[arg1, arg2, ...] => Ebeveyn türün `construct` metodunu parametrelerle çalıştırır.
* super["metot adı"]     => Ebeveyn türün adı verilen bir metodunu çalıştırır.
* super["metot adı", [arg1, arg2, ...]] => Ebeveyn türün adı verilen bir metodunu parametrelerle çalıştırır.

## Türü örnekleyelim
```javascript
var ismail = Insan.new();

    ismail.yasa();
    ismail.konusmaYap( "merhaba dünya" );
```

