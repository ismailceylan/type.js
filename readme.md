Bu javascript kütüphanesi türler ve davranışlar tanımlamanızı sağlar. Tanımlanan bir tür başka
türler tarafından miras alınabilir. Tanımlanan yetenekler de türler tarafından kullanılabilir.

# Örnek kullanım
## Tür oluşturma
```javascript
var Canli = Type( "Canli" ).prototype(
{
    construct: function()
    {
        console.log( "Yaşasın! Hayattayım." );
    }
});
```

## Bazı Yetenekler Olşturalım
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

## Yeni ve güçlü bir tür oluşturalım
```javascript
var Insan = Type( "Insan" ).extends( Canli ).use( NefesAlma, Konusma ).prototype(
{
    construct: function( isim )
    {
        this.super();
        console.log( "Ve adım da " + isim );
        
        this.nefesAl();
        this.konus( "bunlar ilk sözlerim" );
    }
});
```

