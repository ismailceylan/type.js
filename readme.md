Bu javascript kütüphanesi türler ve davranışlar tanımlamanızı sağlar. Tanımlanan bir tür başka
türler tarafından miras alınabilir. Tanımlanan yetenekler de türler tarafından kullanılabilir.

# Örnek kullanım

var Canli = Type( "Canli" ).prototype(
{
    construct: function()
    {
      console.log( "Yaşasın! Hayattayım." );
    }
})
