import { describe } from "mocha";
import { Interface, Trait, Type } from "../src/index.js";
import assert from "assert";

const CanBreath = Trait( "CanBreath" );
const CanBreathUnderwater = Trait( "CanBreathUnderwater" ).use( CanBreath );

const CreatureContract = Interface( "CreatureContract" );
const AnimalContract = Interface( "AnimalContract" )
	.extends( CreatureContract )
	.prototype( animals =>
	{
		animals.property( "speed", Number ).required();
		animals.method( "move", moving =>
		{
			moving.argument( "x", Number ).default( 0 );
			moving.argument( "y", Number ).default( 0 );
			moving.argument( "z", Number ).default( 0 );
			moving.returns( Boolean );
		});
	});

const Creature = Type( "Creature" ).implements( CreatureContract ).prototype(
{
	weight: 0.000001,

	// long definition for cleaning the
	// coverage lack purpose
	getContext: function()
	{
		return this;
	},

	overridedMethods()
	{
		return "original";
	},

	parentReturnWhatParentReturned()
	{
		return "parent";
	},

	shouldPassArgsToParent( arg )
	{
		return arg;
	},

	anyMethod()
	{
		return "any method";
	}
});

const Animal = Type( "Animal" ).extends( Creature ).implements( AnimalContract ).prototype(
{
	speed: 10,

	move()
	{

	},

	overridedMethods()
	{
		return "overridden";
	},

	parentReturnWhatParentReturned()
	{
		return "child-" + parent();
	},

	shouldPassArgsToParent( arg )
	{
		return parent([ arg ]);
	},

	shouldAccessAnyParentMethod()
	{
		return parent( "anyMethod" );
	}
});

const Bug = Type( "Bug" ).extends( Creature );
const Plant = Type( "Plant" ).extends( Creature );

const bird = Animal.create( 10 );
const stevia = Plant.create();

describe( "Is A Relations", () =>
{
	describe( "Between Types", () =>
	{
		it( "Animal should be instanceof Creature", () =>
			assert.equal( Animal instanceof Creature, true )
		);
		
		it( "Creature shouldn't be instanceof Animal", () =>
			assert.notEqual( Creature instanceof Animal, true )
		);
	});
	
	describe( "Between Traits", () =>
	{
		it( "CanBreathUnderwater should be instanceof CanBreath", () =>
			assert.equal( CanBreathUnderwater instanceof CanBreath, true )
		);
	
		it( "CanBreath shouldn't be instanceof CanBreathUnderwater", () =>
			assert.notEqual( CanBreath instanceof CanBreathUnderwater, true )
		);
	});

	describe( "Between Interfaces", () =>
	{
		it( "AnimalContract should be instanceof CreatureContract", () =>
			assert.equal( AnimalContract instanceof CreatureContract, true )
		);

		it( "CreatureContract shouldn't be instanceof AnimalContract", () =>
			assert.notEqual( CreatureContract instanceof AnimalContract, true )
		);
	});

	describe( "Cross Relations", () =>
	{
		it( "Creature should be instanceof CreatureContract", () =>
			assert.equal( Creature instanceof CreatureContract, true )
		);

		it( "Animal should be instanceof AnimalContract", () =>
			assert.equal( Animal instanceof AnimalContract, true )
		);

		it( "Animal should be instanceof CreatureContract", () =>
			assert.equal( Animal instanceof CreatureContract, true )
		);

		it( "Bug should be instanceof CreatureContract", () =>
			assert.equal( Bug instanceof CreatureContract, true )
		);

		it( "Bug shouldn't be instanceof AnimalContract", () =>
			assert.notEqual( Bug instanceof AnimalContract, true )
		);
		
		it( "Plant shouldn't be instanceof AnimalContract", () =>
			assert.notEqual( Plant instanceof AnimalContract, true )
		);
	});

	describe( "Instance Relations", () =>
	{
		it( "bird should be instanceof Animal", () =>
			assert.equal( bird instanceof Animal, true )
		);

		it( "Animal instanceof bird should throw TypeError", () =>
			assert.throws(() =>
				Animal instanceof bird,
				TypeError
			)
		);
	});
});

describe( "Core Vitals", () =>
{
	describe( "Property Inheritance", () =>
	{
		it( "should be available directly on instance", () =>
			assert.equal( bird.hasOwnProperty( "weight" ), true )
		);
	});

	describe( "Method Inheritance", () =>
	{
		it( "this word in parent methods should refers the instance", () =>
			assert.equal( bird.getContext(), bird )
		);

		it( "overrided methods shouldn't run when they called", () =>
			assert.equal( bird.overridedMethods(), "overridden" )
		);
	});

	describe( "Parent Magic Word", () =>
	{
		it( "should access parent method and return what it returned", () =>
			assert.equal( bird.parentReturnWhatParentReturned(), "child-parent" )
		);

		it( "should pass arguments to parent method", () =>
			assert.equal( bird.shouldPassArgsToParent( "foo" ), "foo" )
		);

		it( "should access any parent method", () =>
			assert.equal( bird.shouldAccessAnyParentMethod(), "any method" )
		);
	});
});
