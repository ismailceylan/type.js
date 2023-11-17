export default function readableJoin( items )
{
	if( items.length === 0 )
	{
		return "";
	}
	else if( items.length === 1 )
	{
		return items[ 0 ];
	}
	else if( items.length === 2 )
	{
		return items.join( " or " );
	}
	else
	{
		var latest = items.pop();

		return items.join( ", " ) + " or " + latest; 
	}
}
