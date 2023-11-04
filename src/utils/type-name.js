import { tag } from "./index.js";

export default function tagName( value )
{
	return tag( value ).replace( /\[object (.*?)\]/, "$1" );
}
