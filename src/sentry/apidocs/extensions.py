import inspect
from typing import Any, Dict, List, Optional, Union

from drf_spectacular.extensions import OpenApiAuthenticationExtension, OpenApiSerializerExtension
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import Direction

from sentry.apidocs.spectacular_ports import resolve_type_hint


class TokenAuthExtension(OpenApiAuthenticationExtension):  # type: ignore
    target_class = "sentry.api.authentication.TokenAuthentication"
    name = "auth_token"

    def get_security_requirement(self, auto_schema: AutoSchema) -> Dict[str, List[Any]]:
        permissions = set()
        # TODO: resolve duplicates
        for permission in auto_schema.view.get_permissions():
            for p in permission.scope_map.get(auto_schema.method, []):
                permissions.add(p)

        return {self.name: list(permissions)}

    def get_security_definition(
        self, auto_schema: AutoSchema
    ) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        return {"type": "http", "scheme": "bearer"}


class SentryResponseSerializerExtension(OpenApiSerializerExtension):  # type: ignore
    """
    This extension will register any Sentry Response Serializer as a component that can be used
    in an OpenAPI schema. To have the serializer schema be mapped, you must type the
    `serialize` function with a TypedDict / List.
    """

    priority = 0
    target_class = "sentry.api.serializers.base.Serializer"
    match_subclasses = True

    def get_name(self) -> Optional[str]:
        name: str = self.target.__name__
        return name

    def map_serializer(self, auto_schema: AutoSchema, direction: Direction) -> Any:
        serializer_signature = inspect.signature(self.target.serialize)
        return resolve_type_hint(serializer_signature.return_annotation)


# class SentryInlineResponseSerializerExtension(OpenApiSerializerExtension):  # type: ignore
#     """
#     This extension is used for the `inline_sentry_response_serializer` utils function
#     and will simply resolve the type passed into the function to an OpenAPI schema.
#     """

#     priority = 0
#     target_class = "sentry.apidocs.schemaserializer.RawSchema"
#     match_subclasses = True

#     def get_name(self) -> Optional[str]:
#         name: str = self.target.__name__
#         return name

#     def map_serializer(self, auto_schema: AutoSchema, direction: Direction) -> Any:
#         return resolve_type_hint(self.target.typeSchema)


class RawSchema:
    def __init__(self, t: type) -> None:
        self.typeSchema = t
