import { closured, typeName } from "../../utils/index.js";
import { parentalAccess } from "./index.js";

export default function bindMagicalParentWord(
	finalType, currentType, callerMethodName, root, proto
)
{
	const filename = currentType.name + "." + callerMethodName;
	const method = currentType.methods[ callerMethodName ];
	const scope =
	{
		...method.dependencies,

		parent: ( methodName, args ) =>
		{
			if( typeName( methodName ) == "Array" )
			{
				args = methodName;
				methodName = undefined;
			}

			return parentalAccess( finalType, currentType, callerMethodName, root, proto, methodName, args );
		}
	}

	return closured( method, scope, filename );
}
