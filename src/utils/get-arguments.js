export default function getArguments( fnString )
{
	var matches = fnString.trim().match(
		/^(?:async\s+)?(?:function\s+[\w@$]+\s*\((.*?)\)\s*{|function\s*\((.*?)\)\s*{|[\w@$]+\s*\((.*?)\)\s*{|\(?(.*?)\)?\s*=>{?)/
	);

	var match = ( matches[ 1 ] || matches[ 2 ] || matches[ 3 ] || matches[ 4 ]);

	match = match
		? match.trim().split( "," )
		: [];

	for( var i = 0; i < match.length; i++ )
	{
		match[ i ] = match[ i ].trim();
	}

	return match;
}
