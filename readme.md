# Type.js
This javascript library allows us define interfaces, types and traits. A defined type can be inherited
by other types, traits can also be used by types and types can implements multiple interfaces.

## Mechanism
Type.js uses chained `[[Prototype]]` mechanism. So this means that all inherited type methods and trait methods will collected according proto area and those proto objects will chained. Type.js creates almost the same object as you would get when you use the `class X extends Y` structure, which is the syntactic sugar in Modern JavaScript.

## Interfaces
Interfaces can be considered as abstract types. Arguments of methods, their types, whether they are required or not, and the type of return value can be declared with interfaces. The only thing you can't do is define the body of a method. Interfaces can draw outlines of methods and properties.

So when a type implements one (or more) interfaces, that type have to follow the rules defined in those interfaces. If incompatibility detected an error is thrown and execution stops.

It is immediately checked whether required arguments on methods are defined and if not, error will appear before the relevant method has ever run.

The same thing is done for properties. If required properties are not defined or if the interface declare a type and the property currently does not hold data of that type, errors are thrown.

However, the methods and properties is constantly monitored during runtime to see whether they're called/writed legally. It does this by placing a proxy method instead of the main method you wrote and getter/setter for properties. This may affect performance, but since Type.js is completely native JavaScript, you can enclose the entire interface architecture in if-else blocks. If there is an ENV variable in your work environment that holds values such as `development` and `production`, types decide to implement interfaces or not, depending on that env value. Thus, while you use the interface in the development environment, you can ensure that it is not used in the production environment. You can even ensure that the interface codes do not contamine the compiled codes if your bundler shake trees.

## Usage
### Let's create a trait that specific to living things
```js
var Breathable = Trait( "Breathable" ).prototype(
{
    breath( perMinute )
    {
        console.log( "Yay! I can breath " + perMinute + " times per minute." );
    }
});
```
Trait methods are added to the prototype bags of the types that use it. Therefore, the instance's context
(this word) refers to the type to which they belong, not trait object. However, all properties defined on types and traits are added to the instance that produced from the final type after passing through a property inheritance algorithm. This algorithm produces same result with the class mechanism that comes with EcmaScript 6. That means you won't see any property in any `[[Prototype]]` sections.

### Using a trait's abilities to implement advanced traits
```js
var BreathableUnderwater = Trait( "BreathableUnderwater" )
    .use( Breathable, { breath: "baseBreath" })
    .prototype(
    {
        breathUnderwater()
        {
            this.baseBreath( 10 );
            console.log( "Whoa! I'm breathing under the water. Did you see how coool I am!!" );
        }
    });
```
Traits can extend another trait with `use` method. If we want to inherit another one, we can put another use method at the end of the chain. We can also rename the inherited trait methods as we wish. In the future, when a type uses the final trait, the functions will be included in the type with their changed names.

### Implementing Types
```js
var Creature = Type( "Creature" )
    .use( BreathableUnderwater, { breathUnderwater: "breath" })
    .prototype(
    {
        construct()
        {
            console.log( "Yay! I'm alive." );
        }

        live()
        {
            console.log( "Since I'm alive, why can't I live?" );
        }
    });
```
The `construct` method performs the constructive operations of the type. Each time
created an instance from a type, the method runs once, taking the given parameters. In this
method, we can perform the initializations works, create initial values for properties of the type.

The `use` method on the type objects allow us to use traits. If we want to use another trait we have to prepend another use method to the chain like `Type( ...something ).use( ...trait1, ...rename map).use( ...trait2, ...rename map)`.

### Renaming trait methods when used them
```js
var Creature = Type( "Creature" ).use( BreathableUnderwater, { breath: "exhale" });
```
Now, the Creature type has a exhale method instead of breath.

### Defining Animal Contracts
```js
var AnimalContract = Interface( "AnimalContract", animals =>
{
    animals.property( "abilities", Array ).required();

    animals.method( "move", moving =>
    {
        moving.argument( "speed", Number ).required();
        moving.argument( "x", Number ).default( 0 );
        moving.argument( "y", Number ).default( 0 );
        moving.argument( "z", Number ).default( 0 );
        moving.returns( Object );
    });
});
```
This interface let us declare strictly defined properties, methods, arguments and return types and keep us on track while for example we code animals.

### Let's create intermediate type
```js
var Animal = Type( "Animal" ).extends( Creature ).implements( AnimalContract ).prototype(
{
    abilities: [],

    construct()
    {
        // first, let the creature's constructor work
        parent();
        
        // now, the actions concerning the Animal type can work
        console.log( "I'm not a veggy, there is an animal inside of me" );
    },

    move( speed, x, y, z )
    {
        console.log( "Get out of my way! I'm moving!" );
        return {}
    }
});
```
Type.js injects a magic `parent` word in every method we defined. This works same as the `super` that comes with ES6. But the super can be used only in constructor and static methods. You can use the parent in all methods of your types and access parent type's every method with it.

```js
// ... type definitions going here

foo()
{
    // accessing parent's foo method
    parent();
    // same as above
    parent( "foo" );

    // accessing another parent method possible
    // with type.js but not ES6 super
    parent( "bar" );

    // passes arguments parent.foo( "a", "b" )
    parent([ "a", "b" ]);
    // same as above
    parent( "foo", [ "a", "b" ]);
},

// ... type definitions are continues here
```
That will help us to easily access overloaded or any parent method and reuse their abilities.

### Let's create some humanly traits
```js
var Speakable = Trait( "Speakable" ).prototype(
{
    speak( words )
    {
        console.log( "I'm talking!", words );
    }
});
```
Nowadays, the only species that can speak is humans, but hey, who knows maybe in the future another species can learn to speak. So, defining how to speak in a trait is a clever way to make the ability reusable between species.

### Let's create a new, powerful type
```js
var Human = Type( "Human" ).extends( Animal ).use( Speakable, { speak: "talk" }).prototype(
{
    construct( name )
    {
        // first, let's run animal's construct
        parent();

        // now, we can initialize the Human
        console.log( "And my name is " + name );

        // it should breath immediately otherwise it may die just now
        this.breath();
        // it should speak just now or it may still die
        this.talk( "Those are my first words." );
    }
    
    live()
    {
        // this method has been inherited from the "creature" type up to this point, but we 
        // had to defined the "live" method here again, so we rejected the inheritance, but
        // we want to use benefits of the parent's live method and add something extra after that
        parent();
        
        // now we can improve our heritage
        console.log( "I live like a human!" );
    }
});
```
parent mechanism can bubble. That means if you call parent in a type method, it'll let you to access parent type, obviously. If we call parent in the method that we accessed from child then that make us dive one level deeper again in the inheritance. You can imagine that like `parent().parent()` and so on.

But that doesn't mean we can chain the parent calls. The parent magical method returns the value that returned by the accessed method of the parent type. This means that you won't have a direct connection with the parent of the parent type.

### Let's create instances from types
```js
var ismail = Human.create( "İsmail" );

ismail.live();
ismail.talk( "Hello world!" );
```
All parameters given to the `create` method are passed to the `construct` method of the type.

### Testing "Is A" relations
```js
// please remember that the "ismail" object does not directly extends
// the "Creature" type. It extends the "Animal" intermediate type.
ismail.is( Creature );
// true

ismail.is( Animal );
// true

Human.is( Creature );
// true

Human.is( CreatureContract );
// true

ismail.behave( Breathable );
// true

BreathableUnderwater.behave( Breathable );
// true
```
Type.js allows us to define types. Types can extend other types, and we can check this directly without creating an instance. Types can also implement interfaces, allowing us to test it without instantiation. Finally, types can use traits, and we can verify trait usage without creating an instance.

Also, Type.js allows interfaces to extend multiple interfaces with `extends` method and traits to use multiple traits with `use` method. For checking whether an interface extends other interface, we have an `is` method on interfaces and to check whether a trait uses other traits we have a `behave` method on traits.

We can also perform all the mentioned tests on instances created from types as well.
