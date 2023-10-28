import { Type, Trait } from "./src/index.js";

const Breathable = Trait( "Breathable" ).prototype(
{
	breath()
	{
		console.log( "breathing" );
	}
});

const Creature = Type( "Creature" ).prototype(
{
	live()
	{
		console.log( "im living" );
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
	talk()
	{
		console.log( "talking" );
	}
});

console.log( Human.new( "ok" ).breath() );
