export default class ImplError extends Error
{
	name = "ImplementationError";

	constructor( ...args )
	{
		super( ...args );
	}
}
