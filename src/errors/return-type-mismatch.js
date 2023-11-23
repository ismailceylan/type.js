import { readableJoin, typeName, typeNames } from "../utils/index.js";

export default class ReturnTypeMismatch extends Error
{
	constructor( iface, type, methodRule, returnValue )
	{
		super();

		this.name = "ReturnTypeMismatch";
		this.message = `${ iface.name } interface requires ${ type.name }.${ methodRule.name } method return ${ readableJoin( typeNames( methodRule.returnTypes )).toLowerCase()} but returned ${ typeName( returnValue ).toLowerCase()}.`;
	}
}
