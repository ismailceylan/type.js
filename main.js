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

const WarmBloodedCreatureContract = Interface( "WarmBloodedCreatureContract" )
	.extends( CreatureContract )
	.prototype( function( warmBlood )
	{
		warmBlood.property( "beatSpeed", Number ).required();
	});

const CanBreath = Trait( "CanBreath" ).prototype(
{
	breath( perMinute )
	{
		console.log( "I'm breathing " + perMinute + " times per minute!" );
	}
});

const CanBreathUnderwater = Trait( "CanBreathUnderwater" )
	.use( CanBreath, { breath: "baseBreath" })
	.prototype(
	{
		breathUnderwater()
		{
			this.baseBreath( 10 );
			console.log( "Whoa! I'm breathing underwater. Did you see how coool I am!!" );
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

const Animal = Type( "Animal" )
	.abstract()
	.extends( Creature )
	.implements( WarmBloodedCreatureContract )
	.use( CanBreathUnderwater, { breathUnderwater: "breath" })
	.prototype(
	{
		weight: 50,
		beatSpeed: 10,
		
		walk()
		{
			console.log( "walking" );
		},

		foo()
		{
			console.log(this,"foo animal");
			parent();
		}
	});

const Human = Type( "Human" ).extends( Animal ).prototype(
{
	construct({ weight })
	{
		this.weight += weight;
	
		this.live( 43, false );
		this.breath();
	},

	live( life, is )
	{
		console.log( is, `I have ${ life } days to live.` );
		return "3";
	},
	talk()
	{
		console.log( "talking" );
	},

	foo()
	{
		console.log(this,"foo human");
		parent();
	}
});

const ismail = Human.create({ weight: 88 });

ismail.foo();

console.log( ismail instanceof Human );
console.log( Creature instanceof Animal );
