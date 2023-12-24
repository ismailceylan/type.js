![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/%40iceylan/type.js?label=compiled)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/%40iceylan/type.js?label=compressed)
![npm](https://img.shields.io/npm/dt/%40iceylan/type.js)
![nycrc config on GitHub](https://img.shields.io/nycrc/ismailceylan/type.js?preferredThreshold=branches&label=coverage)
![npm](https://img.shields.io/npm/v/%40iceylan/type.js)
![NPM](https://img.shields.io/npm/l/%40iceylan/type.js)

# Type.js
This javascript library allows us to define types, abstract types, interfaces and traits. Types can be extends by other types and can use multiple traits and interfaces. Also, interfaces and traits can extends their kinds.

## Mechanism
Type.js uses chained `[[Prototype]]` mechanism. So this means that all inherited type and trait methods will collected according proto area and those proto objects will be chained. Type.js bakes almost the same object as you would get when you instantiate the `class X extends Y` structure, which is the syntactic sugar in Modern JavaScript.

## Traits
Traits can be considered as reusable, small ability pieces that can be shared across types.

They can define methods and props and extend other traits. With thus, extender trait becomes an `instanceof` extended trait and all the properties that came from extended trait will be exist in the extender trait. When a Type used that final trait, it will have all the properties that came from extender and extendeds traits. After that, the type and instances created from it, also becomes an `instanceof` all of those traits.

## Interfaces
Interfaces can be considered as blueprints of types. Arguments of methods, their types, whether they are required or not, and the type of return value can be declared with interfaces. The only thing you can't do is define the body of a method. Interfaces can draw outlines of methods and properties.

So when a type implements one (or more) interfaces, that type have to follow the rules defined in those interfaces. If incompatibility detected an error is thrown and execution stops.

It is immediately checked whether required arguments on methods are defined and if not, error will appear before the relevant method has ever run.

The same thing is done for properties. If required properties are not defined or if the interface declare a type and the property currently does not hold that type of data, errors are thrown.

However, the methods and properties is constantly monitored during runtime to see whether they're called/writed legally. It does this by placing a proxy method instead of the main method you wrote and getter/setter for properties. This may affect performance, but since Type.js is completely native JavaScript, you can enclose the entire interface architecture in if-else blocks. If there is an ENV variable in your work environment that holds values such as `development` and `production`, types can make their decision to implements interfaces or not, depending on that env value. Thus, while you use the interface in the development environment, you can ensure that it is not used in the production environment. You can even ensure that the interface codes do not contamine the compiled codes if your bundler shake trees.

Interfaces can extend as many interfaces as needed. With thus, extender interfaces becomes an `instanceof` extended interfaces. The type that implements extender interface should also have to implements all the extended interface rules. After that, the type and instances baked from it, also becomes an `instanceof` all of those interfaces.

Yes, methods are required already and we can define required props if we wish in the interfaces. Types that implemented it should define them, this is a debt for types and there is no escaping from it. But there is one tricky part about it which is we can leave this debt to a child type. If a type declares itself as a abstract type then that type doesn't have to define the rules that coming from implemented or inherited interfaces. But a child type at the any level of the inheritance that extends this abstract type directly or indirectly should define the required things. If not, errors will be thrown. Debts should be get paid eventually.

## Installation
```sh
npm install @iceylan/type.js
```

After installed the Type.js in your project, you can import the modules that you needed as ES modules. Currently requiring with commonjs doesn't supported.

```js
import { Type, Trait, Interface } from "@iceylan/type.js";

const Foo = Type( "Foo" );
```

## Usage
### Creating Traits
```js
const CanBreath = Trait( "CanBreath" ).prototype(
{
    breath( perMinute )
    {
        console.log( "Yay! I can breath " + perMinute + " times per minute." );
    }
});
```
Trait methods are added to the prototype bags of the types that use it. Therefore, the instance's context
(this word) refers to the type to which they belong, not trait object. However, all properties defined on types and traits are added to the instance that produced from the final type after passing through a property inheritance algorithm. This algorithm produces same result with the class mechanism that comes with EcmaScript 6. That means you won't see any property in any `[[Prototype]]` sections.

### Extending Traits
```js
const CanBreathUnderwater = Trait( "CanBreathUnderwater" );

CanBreathUnderwater.use( CanBreath,
{
    breath: "baseBreath"
});

CanBreathUnderwater.prototype(
{
    breathUnderwater()
    {
        this.baseBreath( 10 );
        console.log( "Whoa! I'm breathing under water. Did you see how coool I am!!" );
    }
});
```
Traits can extend another trait with `use` method. If we want to inherit another one, we can put another use method at the end of the chain. We can also rename the inherited trait methods as we wish. In the future, when a type uses the final trait, the functions will be included in the type with their changed names.

### Creating Types
```js
const Creature = Type( "Creature" )
    .use( CanBreathUnderwater, { breathUnderwater: "breath" })
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

### Renaming Trait Methods
```js
const Creature = Type( "Creature" ).use( CanBreathUnderwater,
{
    breath: "exhale"
});
```
Now, the Creature type has a exhale method instead of breath.

### Creating Interfaces
```js
const AnimalContract = Interface( "AnimalContract", animals =>
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

### Extending Interfaces
```js
const WarmBloodedCreatureContract = Interface( "WarmBloodedCreatureContract" );

WarmBloodedCreatureContract
    .extends( AnimalContract )
    .prototype( warmBloodeds =>
    {
        warmBloodeds.property( "heartBeatSpeed", Number ).required();
    });
```
We can declare rules as second argument of the `Interface` or use `prototype` method for it. Now the *WarmBloodedCreatureContract* declares two properties and one method.

### Extending Types
```js
const Animal = Type( "Animal" )
    .extends( Creature )
    .implements( WarmBloodedCreatureContract )
    .prototype(
    {
        abilities: [],
        heartBeatSpeed: 10,

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
We can use `implements` method to declare that we are going to follow rules of an interface. Method accepts multiple interfaces like `implements( iface1, iface2, ...)`.

Also, type.js injects a magic `parent` word in every method we defined. This works same as the `super` that comes with ES6. But the super can be used only in constructor and static methods. You can use the parent in all methods of your types and access parent type's every method with it.

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

### Creating Abilities As Traits
```js
const CanSpeak = Trait( "CanSpeak" ).prototype(
{
    speak( words )
    {
        console.log( "I'm talking!", words );
    }
});
```
Nowadays, the only species that can speak is humans, but hey, who knows maybe in the future another species can learn to speak. So, defining how to speak in a trait is a clever way to make the ability reusable between species.

### Creating Final Types
```js
const Human = Type( "Human" ).extends( Animal ).use( CanSpeak, { speak: "talk" }).prototype(
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

### Creating Instances From Types
```js
const ismail = Human.create( "İsmail" );

ismail.live();
ismail.talk( "Hello world!" );
```
All parameters given to the `create` method are passed to the `construct` method of the type.

### Testing "Is A" Relations
Type.js provide abilities to test "is a" relations. `instanceof` expression also supported.

#### Same Kind Relations
##### 1. relations between traits
```js
CanBreathUnderwater.behave( CanBreath ); // true
CanBreathUnderwater instanceof CanBreath; // true

CanBreath instanceof CanBreathUnderwater; // false
```
Since traits can use each other we can test it with `behave` method or put them into `instanceof` expression.

##### 2. relations between interfaces
```js
WarmBloodedCreatureContract.is( CreatureContract ); // true
WarmBloodedCreatureContract instanceof CreatureContract; // true
```
Interfaces can extends each other, too. We can test it with `is` method or put them into `instanceof` expression.

##### 3. relations between types
```js
Human.is( Creature ); // true
Human instanceof Creature; // true
```
Types also extends each other. So we can test it with `is` method. `instanceof` expression works same as well.

#### Cross Kind Relations
##### 1. relations between types and traits
```js
Human.behave( CanBreath ); // true
Human instanceof CanBreath; // true
```
We know that types can use traits and we can test it with `behave` method or we can use `instanceof` expression. Please pay attention that there are no type used `CanBreath` trait directly in the inheritance chain. Instead the `Creature` type used the `CanBreathUnderwater` trait which it uses the `CanBreath` trait. All of these are means that the `Human` type uses `CanBreath` trait indirectly but testing the relation will give us a *true*, as it's supposed to be.

##### 2. relations between types and interfaces
```js
Human.is( AnimalContract ); // true
Human instanceof AnimalContract; // true
```
Types can implements interfaces and we can test it with `is` method or `instanceof` expression. Testing behaviours between inherited interface are same as mentioned above for traits. `AnimalContract` is an indirectly inherited interface for `Human` type but testing it will give us *true*.

#### Tests On Instances
```js
ismail.behave( CanBreath ); // true
ismail instanceof CanBreath // true

ismail.is( AnimalContract ); // true
ismail instanceof AnimalContract; // true

ismail.is( Human ); // true
ismail instanceof Human; // true

Human.is( ismail ); // false
Human instanceof ismail;
// TypeError: Right-hand side of 'instanceof' is not callable
```

Tests on instances results exactly same as mentioned above. Types, traits or interfaces can't test instances, but instances can.
