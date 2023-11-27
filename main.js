import { Type, Trait, Interface } from "./src/index.js";

const CreatureContract = Interface( "CreatureContract", function( creatures )
{
	creatures.property( "weight", Number ).required();

	creatures.method( "live", function( live )
	{
		live.argument( "life", Number ).required();
		live.argument( "is" ).required();
		live.returns( String );
	});
});

const Breathable = Trait( "Breathable" ).prototype(
{
	breath()
	{
		console.log( "breathing" );
	}
});

const Creature = Type( "Creature" ).implements( CreatureContract ).prototype(
{
	weight: 12,

	live( life, is )
	{
		console.log( is, `I have ${ life } days to live.` );

		return "3";
	},

	foo()
	{
		console.log(this,"foo creature");
	}
});

const Animal = Type( "Animal" ).extends( Creature ).use( Breathable, { breath: "great" }).prototype(
{
	walk()
	{
		console.log( "walking" );
	},

	foo()
	{
		console.log(this,"foo animal");
		parent( "foo" );
	}
});

const Human = Type( "Human" ).extends( Animal ).prototype(
{
	construct({ weight })
	{
		this.weight += weight;
	
		this.live( 43, false );
		this.great();
	},

	talk()
	{
		console.log( "talking" );
	},

	foo()
	{
		console.log(this,"foo human");
		parent( "foo" );
	}
});

const ismail = Human.create({ weight: 88 });

console.log(
{
	isIsmailBreathable: ismail.behave( Breathable ),
	isIsmailAnimal: ismail.is( "Animal" ),
	isIsmailSharesCreatureContract: ismail.is( CreatureContract ),
});

ismail.foo();
