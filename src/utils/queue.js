import { each } from "./index.js";

let queue = [];
let timer;

export function add( type )
{
	queue.push( type );

	clearTimeout( timer );

	timer = setTimeout( eatAll );
}

export function stop()
{
	clearTimeout( timer );
}

export function empty()
{
	queue.length = 0;
}

export function handle( type )
{
	const revalidate = validator => validator( type );

	try
	{
		each( type.getInheritedMissedProperties(), revalidate );
		each( type.getInheritedMissedMethods(), revalidate );
	}
	catch( e )
	{
		stop();
		throw e;
	}
}

export function unwatch( type )
{
	for( const [ i, item ] of queue.entries())
	{
		if( item === type )
		{
			queue = queue.splice( i, 1 );
		}
	}
}

function eatAll()
{
	for( const type of queue )
	{
		handle( type );
	}

	empty();
}
