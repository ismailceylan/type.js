import { tag } from "./index.js";

export default function args( argsObject )
{
	return tag( argsObject ) == "[object Array]"
		? argsObject
		: Array.prototype.slice.call( argsObject );
}
