# coding: utf-8

"""
    Trieve API

    Trieve OpenAPI Specification. This document describes all of the operations available through the Trieve API.

    The version of the OpenAPI document: 0.12.0
    Contact: developers@trieve.ai
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


from __future__ import annotations
import pprint
import re  # noqa: F401
import json

from pydantic import BaseModel, ConfigDict, Field, StrictBool, StrictFloat, StrictInt, StrictStr
from typing import Any, ClassVar, Dict, List, Optional, Union
from typing_extensions import Annotated
from trieve_py_client.models.chunk_filter import ChunkFilter
from trieve_py_client.models.highlight_options import HighlightOptions
from trieve_py_client.models.scoring_options import ScoringOptions
from trieve_py_client.models.search_method import SearchMethod
from trieve_py_client.models.sort_options import SortOptions
from trieve_py_client.models.typo_options import TypoOptions
from typing import Optional, Set
from typing_extensions import Self

class AutocompleteReqPayload(BaseModel):
    """
    AutocompleteReqPayload
    """ # noqa: E501
    content_only: Optional[StrictBool] = Field(default=None, description="Set content_only to true to only returning the chunk_html of the chunks. This is useful for when you want to reduce amount of data over the wire for latency improvement (typically 10-50ms). Default is false.")
    extend_results: Optional[StrictBool] = Field(default=None, description="If specified to true, this will extend the search results to include non-exact prefix matches of the same search_type such that a full page_size of results are returned. Default is false.")
    filters: Optional[ChunkFilter] = None
    highlight_options: Optional[HighlightOptions] = None
    page_size: Optional[Annotated[int, Field(strict=True, ge=0)]] = Field(default=None, description="Page size is the number of chunks to fetch. This can be used to fetch more than 10 chunks at a time.")
    query: StrictStr = Field(description="Query is the search query. This can be any string. The query will be used to create an embedding vector and/or SPLADE vector which will be used to find the result set.")
    remove_stop_words: Optional[StrictBool] = Field(default=None, description="If true, stop words (specified in server/src/stop-words.txt in the git repo) will be removed. Queries that are entirely stop words will be preserved.")
    score_threshold: Optional[Union[StrictFloat, StrictInt]] = Field(default=None, description="Set score_threshold to a float to filter out chunks with a score below the threshold. This threshold applies before weight and bias modifications. If not specified, this defaults to 0.0.")
    scoring_options: Optional[ScoringOptions] = None
    search_type: SearchMethod
    slim_chunks: Optional[StrictBool] = Field(default=None, description="Set slim_chunks to true to avoid returning the content and chunk_html of the chunks. This is useful for when you want to reduce amount of data over the wire for latency improvement (typically 10-50ms). Default is false.")
    sort_options: Optional[SortOptions] = None
    typo_options: Optional[TypoOptions] = None
    use_quote_negated_terms: Optional[StrictBool] = Field(default=None, description="If true, quoted and - prefixed words will be parsed from the queries and used as required and negated words respectively. Default is false.")
    user_id: Optional[StrictStr] = Field(default=None, description="User ID is the id of the user who is making the request. This is used to track user interactions with the search results.")
    __properties: ClassVar[List[str]] = ["content_only", "extend_results", "filters", "highlight_options", "page_size", "query", "remove_stop_words", "score_threshold", "scoring_options", "search_type", "slim_chunks", "sort_options", "typo_options", "use_quote_negated_terms", "user_id"]

    model_config = ConfigDict(
        populate_by_name=True,
        validate_assignment=True,
        protected_namespaces=(),
    )


    def to_str(self) -> str:
        """Returns the string representation of the model using alias"""
        return pprint.pformat(self.model_dump(by_alias=True))

    def to_json(self) -> str:
        """Returns the JSON representation of the model using alias"""
        # TODO: pydantic v2: use .model_dump_json(by_alias=True, exclude_unset=True) instead
        return json.dumps(self.to_dict())

    @classmethod
    def from_json(cls, json_str: str) -> Optional[Self]:
        """Create an instance of AutocompleteReqPayload from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self) -> Dict[str, Any]:
        """Return the dictionary representation of the model using alias.

        This has the following differences from calling pydantic's
        `self.model_dump(by_alias=True)`:

        * `None` is only added to the output dict for nullable fields that
          were set at model initialization. Other fields with value `None`
          are ignored.
        """
        excluded_fields: Set[str] = set([
        ])

        _dict = self.model_dump(
            by_alias=True,
            exclude=excluded_fields,
            exclude_none=True,
        )
        # override the default output from pydantic by calling `to_dict()` of filters
        if self.filters:
            _dict['filters'] = self.filters.to_dict()
        # override the default output from pydantic by calling `to_dict()` of highlight_options
        if self.highlight_options:
            _dict['highlight_options'] = self.highlight_options.to_dict()
        # override the default output from pydantic by calling `to_dict()` of scoring_options
        if self.scoring_options:
            _dict['scoring_options'] = self.scoring_options.to_dict()
        # override the default output from pydantic by calling `to_dict()` of sort_options
        if self.sort_options:
            _dict['sort_options'] = self.sort_options.to_dict()
        # override the default output from pydantic by calling `to_dict()` of typo_options
        if self.typo_options:
            _dict['typo_options'] = self.typo_options.to_dict()
        # set to None if content_only (nullable) is None
        # and model_fields_set contains the field
        if self.content_only is None and "content_only" in self.model_fields_set:
            _dict['content_only'] = None

        # set to None if extend_results (nullable) is None
        # and model_fields_set contains the field
        if self.extend_results is None and "extend_results" in self.model_fields_set:
            _dict['extend_results'] = None

        # set to None if filters (nullable) is None
        # and model_fields_set contains the field
        if self.filters is None and "filters" in self.model_fields_set:
            _dict['filters'] = None

        # set to None if highlight_options (nullable) is None
        # and model_fields_set contains the field
        if self.highlight_options is None and "highlight_options" in self.model_fields_set:
            _dict['highlight_options'] = None

        # set to None if page_size (nullable) is None
        # and model_fields_set contains the field
        if self.page_size is None and "page_size" in self.model_fields_set:
            _dict['page_size'] = None

        # set to None if remove_stop_words (nullable) is None
        # and model_fields_set contains the field
        if self.remove_stop_words is None and "remove_stop_words" in self.model_fields_set:
            _dict['remove_stop_words'] = None

        # set to None if score_threshold (nullable) is None
        # and model_fields_set contains the field
        if self.score_threshold is None and "score_threshold" in self.model_fields_set:
            _dict['score_threshold'] = None

        # set to None if scoring_options (nullable) is None
        # and model_fields_set contains the field
        if self.scoring_options is None and "scoring_options" in self.model_fields_set:
            _dict['scoring_options'] = None

        # set to None if slim_chunks (nullable) is None
        # and model_fields_set contains the field
        if self.slim_chunks is None and "slim_chunks" in self.model_fields_set:
            _dict['slim_chunks'] = None

        # set to None if sort_options (nullable) is None
        # and model_fields_set contains the field
        if self.sort_options is None and "sort_options" in self.model_fields_set:
            _dict['sort_options'] = None

        # set to None if typo_options (nullable) is None
        # and model_fields_set contains the field
        if self.typo_options is None and "typo_options" in self.model_fields_set:
            _dict['typo_options'] = None

        # set to None if use_quote_negated_terms (nullable) is None
        # and model_fields_set contains the field
        if self.use_quote_negated_terms is None and "use_quote_negated_terms" in self.model_fields_set:
            _dict['use_quote_negated_terms'] = None

        # set to None if user_id (nullable) is None
        # and model_fields_set contains the field
        if self.user_id is None and "user_id" in self.model_fields_set:
            _dict['user_id'] = None

        return _dict

    @classmethod
    def from_dict(cls, obj: Optional[Dict[str, Any]]) -> Optional[Self]:
        """Create an instance of AutocompleteReqPayload from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return cls.model_validate(obj)

        _obj = cls.model_validate({
            "content_only": obj.get("content_only"),
            "extend_results": obj.get("extend_results"),
            "filters": ChunkFilter.from_dict(obj["filters"]) if obj.get("filters") is not None else None,
            "highlight_options": HighlightOptions.from_dict(obj["highlight_options"]) if obj.get("highlight_options") is not None else None,
            "page_size": obj.get("page_size"),
            "query": obj.get("query"),
            "remove_stop_words": obj.get("remove_stop_words"),
            "score_threshold": obj.get("score_threshold"),
            "scoring_options": ScoringOptions.from_dict(obj["scoring_options"]) if obj.get("scoring_options") is not None else None,
            "search_type": obj.get("search_type"),
            "slim_chunks": obj.get("slim_chunks"),
            "sort_options": SortOptions.from_dict(obj["sort_options"]) if obj.get("sort_options") is not None else None,
            "typo_options": TypoOptions.from_dict(obj["typo_options"]) if obj.get("typo_options") is not None else None,
            "use_quote_negated_terms": obj.get("use_quote_negated_terms"),
            "user_id": obj.get("user_id")
        })
        return _obj


