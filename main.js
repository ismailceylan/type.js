import { Type, Trait, Interface } from "./src/index.js";

const CreatureContract = Interface( "CreatureContract", function( creatures )
{
	creatures
		.property( "weight", Number )
		.method( "live", function( live )
		{
			live.argument( Number ).required();
			live.argument( Boolean ).default( null );
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
	weight: 2,
	live( life, is )
	{
		console.log( is, `I have ${ life } days to live.` );
	}
});

const Animal = Type( "Animal" ).extends( Creature ).use( Breathable ).prototype(
{
	walk()
	{
		console.log( "walking" );
	}
});

const Human = Type( "Human" ).extends( Animal ).prototype(
{
	construct({ weight })
	{
		this.weight = weight;

		this.live( 43 );
		this.breath();
	},

	talk()
	{
		console.log( "talking" );
	}
});

const ismail = Human.new({ weight: 88 });

console.log( ismail.behave( Breathable ));
