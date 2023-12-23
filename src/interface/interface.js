import { Type } from "../index.js";
import { Builder } from "./index.js";
import { BreakSignal } from "../symbols.js";
import { allowed, clone, each, getArguments, setTag } from "../utils/index.js";
import {
	MissingArgumentError, PropAssignTypeMismatchError,
	MissingMethodError, MissingPropError, PropTypeMismatchError,
	ArgumentTypeMismatch, ReturnTypeMismatch
} from "../errors/index.js";

export default function Interface( name, build )
{
	if( ! ( this instanceof Interface ))
	{
		return new Interface( name, build );
	}

	const builder = new Builder;

	if( build )
	{
		build( builder );
	}

	/**
	 * Interface name.
	 * 
	 * @type {String}
	 */
	this.name = setTag( this, name );

	/**
	 * Interface properties.
	 * 
	 * @type {Object}
	 */
	this.properties = builder.properties;

	/**
	 * Interface methods.
	 * 
	 * @type {Object}
	 */
	this.methods = builder.methods;

	/**
	 * Extended interface list.
	 * 
	 * @type {Array}
	 */
	this.interfaces = [ this ];

	/**
	 * Applies the represented Interface to a given Type object.
	 * 
	 * @param {Type} type a type object to apply this interface
	 */
	this.apply = function( type )
	{
		validateProperties.call( this, type );
		validateMethods.call( this, type );
	}

	/**
	 * Extends the existing interface with the given interface.
	 * 
	 * @param {...Interface} interfaces interface to extend
	 * @return {Interface}
	 */
	this.extends = function( ...interfaces )
	{
		for( const targetInterface of interfaces )
		{
			clone( targetInterface.properties, this.properties );
			clone( targetInterface.methods, this.methods );

			this.interfaces.push( targetInterface );
		}

		return this;
	}

	/**
	 * It takes the method that creates the interface rules and
	 * runs it, and the rules created by the developer are turned
	 * into objects that are easy to read and manipulate.
	 * 
	 * @param {Function} build interface builder method
	 * @returns {Interface}
	 */
	this.prototype = function( build )
	{
		build( builder );
		return this;
	}

	/**
	 * Tells whether the represented interface inherits the
	 * given interface.
	 * 
	 * @param {Interface} Interface an interface to check
	 * @returns {Boolean}
	 */
	this.is = function( Interface )
	{
		for( const iface of this.interfaces )
		{
			if( iface === Interface )
			{
				return true;
			}
		}

		return false;
	}

	/**
	 * Tests whether given target created from a Type that
	 * implements this interface or given interface extends
	 * this interface.
	 * 
	 * It's also a trap for instanceof scenarios.
	 * 
	 * @param {Interface} target 
	 * @returns {Boolean}
	 */
	this[ Symbol.hasInstance ] = function( target )
	{
		return target.is( this );
	}

	function validateProperties( type )
	{
		each( this.properties, prop =>
		{
			if( validateProperty.call( this, type, prop ) === BreakSignal )
			{
				return BreakSignal;
			}
		});
	}

	function validateProperty( type, rule )
	{
		const name = rule.name;
		const allows = rule.types;
		const required = rule.isRequired;
		const defined = name in type.properties;
		const value = type.properties[ name ];
		const restricted = allows.length > 0;
		const isTypeAbstract = type.isAbstract;

		// checking if prop needs to be defined
		if( required && ! defined )
		{
			if( isTypeAbstract )
			{
				type.missedProperties[ name ] =
					type => validateProperty.call( this, type, rule );

				return BreakSignal;
			}

			// prop not defined directly on type
			throw new MissingPropError( this, type, rule );
		}

		// type checking
		if( defined && restricted && ! allowed( value, allows ))
		{
			throw new PropTypeMismatchError( this, type, rule, value );
		}

		// if prop restricted for specific types
		// we have to observe future writings
		if( restricted )
		{
			watchProp( this, type, rule );
		}
	}

	function watchProp( iface, type, rule )
	{
		// type instantiator will collect these props and put
		// them all into the latest level of [[Prototype]]
		// so the $proxified_ will an indicator for it
		type.properties[ Type.PROXY_PROP_PREFIX + rule.name ] =
			type.properties[ rule.name ];

		Object.defineProperty( type.properties, rule.name,
		{
			get: function()
			{
				return this[ Type.PROXY_KEY ][ rule.name ];
			},

			set: function( v )
			{
				if( ! allowed( v, rule.types ))
				{
					throw new PropAssignTypeMismatchError( iface, type, rule, v );
				}

				this[ Type.PROXY_KEY ][ rule.name ] = v;
			}
		});
	}

	function validateMethods( type )
	{
		each( this.methods, method =>
		{
			if( validateMethod.call( this, type, method ) === BreakSignal )
			{
				return BreakSignal;
			}
		});
	}

	function validateMethod( type, rule )
	{
		const methodName = rule.name;
		const defined = methodName in type.methods;
		const isTypeAbstract = type.isAbstract;

		// all the methods are required
		if( ! defined )
		{
			// if the type is abstract then this type
			// doesn't have to define the method
			if( isTypeAbstract )
			{
				// but still child types have to define the method
				// so this type is going to leave a debt to it's childs
				type.missedMethods[ methodName ] =
					type => validateMethod.call( this, type, rule );
	
				return BreakSignal;
			}

			throw new MissingMethodError( this, type, rule );
		}

		const method = type.methods[ methodName ];
		const definedArgs = getArguments( method.toString());
		const returns = rule.returnTypes;

		for( const [ i, argRule ] of rule.arguments.entries())
		{
			const argNameInDefinition = definedArgs[ i ];
			const required = argRule.isRequired;

			// argument is required and not defined on the method
			if( required && argNameInDefinition === undefined )
			{
				throw new MissingArgumentError( this, type, rule, argRule, i );
			}
		}

		// to observe argument types on runtime we have to
		// proxify the original method so we can keep under
		// control what is coming and even returning
		const proxifiedMethod = type.methods[ methodName ];

		function interfaceProxy( ...receivedArgs )
		{
			for( let i = 0; i < $rule.arguments.length; i++ )
			{
				const argRule = $rule.arguments[ i ];
				const required = argRule.isRequired;
				const argDefault = argRule.defaultValue;
				let receivedArg = receivedArgs[ i ];
				const argNameInRule = argRule.name;
				const argNameInDefinition = $definedArgs[ i ];
				const allows = argRule.types;
				const restricted = allows.length > 0;

				// if the argument required but not received any value
				if( required && receivedArg === undefined )
				{
					// If a default value is defined we will use it  
					if( argDefault !== undefined )
					{
						receivedArgs[ i ] = receivedArg = argDefault;
					}
					else
					{
						throw new $ArgumentTypeMismatch( $iface, $type, $rule, argRule, i );
					}
				}
				// not required and not passed anything
				else if( ! required && receivedArg === undefined )
				{
					if( argDefault !== undefined )
					{
						receivedArgs[ i ] = receivedArg = argDefault;
					}
					
					// there is nothing to complain
				}
				else if( restricted && ! $allowed( receivedArg, allows ))
				{
					throw new $ArgumentTypeMismatch(
						$iface, $type, $rule, argRule, i, receivedArg
					);
				}
			}

			const returnValue = $proxifiedMethod.apply( this, receivedArgs );

			if( $returns.length > 0 && ! $allowed( returnValue, $returns ))
			{
				throw new $ReturnTypeMismatch( $iface, $type, $rule, returnValue );
			}

			return returnValue;
		}

		interfaceProxy.dependencies =
		{
			$type: type,
			$iface: this,
			$returns: returns,
			$allowed: allowed,
			$rule: rule,
			$definedArgs: definedArgs,
			$proxifiedMethod: proxifiedMethod,
			$ReturnTypeMismatch: ReturnTypeMismatch,
			$ArgumentTypeMismatch: ArgumentTypeMismatch,
		}

		type.methods[ methodName ] = interfaceProxy;
	}
}
