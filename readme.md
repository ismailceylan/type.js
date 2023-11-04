This javascript library allows define types and traits. An identified type can be inherited
by other types. Defined traits can also be use by other traits (traits are extendable) or used by types.

This library uses single level prototype mechanism. So this means that all inheritances and trait usage declarations are collected in the final class.

## Usage
### Let's create a trait specific to living things
```javascript
var Breathable = Trait( "Breathable" ).prototype(
{
    breath: function()
    {
        console.log( "Yay! I can breath." );
    }
});
```
Traits are added to the prototype area of the types that use it. Therefore, the instance scope
(this word) refers to the type to which they belong.

### Implementing Types
```javascript
var Creature = Type( "Creature" ).use( Breathable ).prototype(
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
The `construct` method performs the constructive operations of the type. Each time
created an instance from a type, it runs once, taking the given parameters. In this
method, we can perform the installation procedures and provide the necessary values
to the features we need to initialize.

### Let's create intermediate type
```javascript
var Animal = Type( "Animal" ).extends( Creature ).prototype(
{
    construct: function()
    {
        // first, let the creature's constructor work
        this.super( "construct" );
        
        // now, the actions concerning the Animal type can work
        console.log( "I'm not a veggy, there is an animal inside of me" );
    }
});
```
### Let's create some humanly traits
```javascript
var Speakable = Trait( "Speakable" ).prototype(
{
    speak: function( words )
    {
        console.log( "I'm talking!", words );
    }
});
```

The trait can also define the 'construct' method. This method will also work on
the instance of the Type that uses the trait. It provides a useful space for
performing primitive actions related to trait. So it is not necessary to create
pollution within the constructor of the Type.

### Let's create a new and powerful type
```javascript
var Human = Type( "Human" ).extends( Animal ).use( Speakable ).prototype(
{
    AS:
    {
        // we can rename the method "speak" taken from
        // the trait named "Speakable" as "talk"
        speak: "talk"
    },
    
    construct: function( name )
    {
        // first, let's run animal's constructor
        this.super( "construct" );

        // now, we can initialize the Human
        console.log( "And my name is " + name );
        
        // it should breath immediately otherwise it may die just now
        this.breath();
        // it should speak just now or it may still die
        this.talk( "Those are my first words." );
    }
    
    live: function()
    {
        // this method has been inherited from the "creature" type up to this point, but
        // we have defined the "live" method here again, so we rejected the inheritance, but
        // I want to add something on developing this heritage, not to refuse it.
        this.super( "live" );
        
        // now we can improve our heritage.
        console.log( "I live like a human!" );
    }
});
```

The `super` method provides access to the inherited type.

##### Calling a particular method of the parent
super(String, [...Array])

##### Calling the construct method of the parent
super(...Params)

##### Accessing the parent context
super()

### Let's create instances from types
```javascript
var ismail = Human.new( "İsmail" );

    ismail.live();
    ismail.talk( "Hello world!" );
```

### Testing "Is A" relations
```javascript
// please remember that the "ismail" object does not directly extends
// the "Creature" type. It extends the "Animal" intermediate type.
ismail.is( Creature );
// true

ismail.is( Animal );
// true

Human.is( Creature );
// true

ismail.behave( Breathable );
// true
```

### Creating singleton object from types
```javascript
// ## app.js
var somebody = Human.singleton( "mykey", [ "Donald" ]);
    somebody.lastName = "Trump";

// ## same runtime
// ## islem.js
Human.singleton( "mykey" ).lastName;
// -- or --
Human.instance.mykey.lastName;
// Trump
```
### Accessing type related meta datas from instances
```javascript
var janedoe = Human.new( "Jane Doe" );

    janedoe.type.name;
    // Human
    
    janedoe.type.behaviours;
    // [ "Breathable", "Speakable" ]
    
    janedoe.type.types;
    // [ "Human", "Animal", "Creature" ]
```
