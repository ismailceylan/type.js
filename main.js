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

const Breathable = Trait( "Breathable" ).prototype(
{
	breath( perMinute )
	{
		console.log( "I'm breathing " + perMinute + " times per minute!" );
	}
});

const UnderwaterBreathable = Trait( "UnderwaterBreathable" )
	.use( Breathable, { breath: "baseBreath" })
	.prototype(
	{
		breathUnderwater()
		{
			this.baseBreath( 10 );
			console.log( "Whoa! I'm breathing underwater. Did you see how coool I am!!" );
		}
	});

const Creature = Type( "Creature" ).implements( WarmBloodedCreatureContract ).prototype(
{
	weight: 12,
	beatSpeed: 59,

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
	.extends( Creature )
	.use( UnderwaterBreathable, { breathUnderwater: "breath" })
	.prototype(
	{
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

console.log(
{
	isIsmailBreathable: ismail.behave( Breathable ),
	isIsmailAnimal: ismail.is( Animal ),
	isIsmailSharesCreatureContract: ismail.is( CreatureContract ),
	isHumanTypeAlsoCreature: Human.is( Creature ),
	isUnderwaterBreathableExtendsBreathable: UnderwaterBreathable.behave( Breathable ),
	isCreatureContractWarmBloodedCreatureContract: CreatureContract.is( WarmBloodedCreatureContract ),
	isWarmBloodedCreatureContractCreatureContract: WarmBloodedCreatureContract.is( CreatureContract ),
	isHumanWarmBlooded: Human.is( WarmBloodedCreatureContract )
});

ismail.foo();
