# RagQueryEvent


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**created_at** | **str** |  | 
**dataset_id** | **str** |  | 
**id** | **str** |  | 
**rag_type** | **str** |  | 
**results** | [**List[ChunkMetadataStringTagSet]**](ChunkMetadataStringTagSet.md) |  | 
**search_id** | **str** |  | 
**user_id** | **str** |  | 
**user_message** | **str** |  | 

## Example

```python
from trieve_py_client.models.rag_query_event import RagQueryEvent

# TODO update the JSON string below
json = "{}"
# create an instance of RagQueryEvent from a JSON string
rag_query_event_instance = RagQueryEvent.from_json(json)
# print the JSON string representation of the object
print(RagQueryEvent.to_json())

# convert the object into a dict
rag_query_event_dict = rag_query_event_instance.to_dict()
# create an instance of RagQueryEvent from a dict
rag_query_event_form_dict = rag_query_event.from_dict(rag_query_event_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

