# coding: utf-8

"""
    Trieve API

    Trieve OpenAPI Specification. This document describes all of the operations available through the Trieve API.

    The version of the OpenAPI document: 0.12.0
    Contact: developers@trieve.ai
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest

from trieve_py_client.models.update_dataset_req_payload import UpdateDatasetReqPayload

class TestUpdateDatasetReqPayload(unittest.TestCase):
    """UpdateDatasetReqPayload unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional) -> UpdateDatasetReqPayload:
        """Test UpdateDatasetReqPayload
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `UpdateDatasetReqPayload`
        """
        model = UpdateDatasetReqPayload()
        if include_optional:
            return UpdateDatasetReqPayload(
                crawl_options = {"body_remove_strings":["Edit on github"],"boost_titles":true,"exclude_paths":["https://example.com/exclude*"],"exclude_tags":["#ad","#footer"],"heading_remove_strings":["Advertisement","Sponsored"],"include_paths":["https://example.com/include*"],"include_tags":["h1","p","a",".main-content"],"interval":"daily","limit":1000,"site_url":"https://example.com"},
                dataset_id = '',
                dataset_name = '',
                new_tracking_id = '',
                server_configuration = {"BM25_AVG_LEN":256.0,"BM25_B":0.75,"BM25_ENABLED":true,"BM25_K":0.75,"DISTANCE_METRIC":"cosine","EMBEDDING_BASE_URL":"https://api.openai.com/v1","EMBEDDING_MODEL_NAME":"text-embedding-3-small","EMBEDDING_QUERY_PREFIX":"","EMBEDDING_SIZE":1536,"FREQUENCY_PENALTY":0.0,"FULLTEXT_ENABLED":true,"INDEXED_ONLY":false,"LLM_BASE_URL":"https://api.openai.com/v1","LLM_DEFAULT_MODEL":"gpt-3.5-turbo-1106","LOCKED":false,"MAX_LIMIT":10000,"MESSAGE_TO_QUERY_PROMPT":"Write a 1-2 sentence semantic search query along the lines of a hypothetical response to: \n\n","N_RETRIEVALS_TO_INCLUDE":8,"PRESENCE_PENALTY":0.0,"RAG_PROMPT":"Use the following retrieved documents to respond briefly and accurately:","SEMANTIC_ENABLED":true,"STOP_TOKENS":["\n\n","\n"],"SYSTEM_PROMPT":"You are a helpful assistant","TEMPERATURE":0.5,"USE_MESSAGE_TO_QUERY_PROMPT":false},
                tracking_id = ''
            )
        else:
            return UpdateDatasetReqPayload(
        )
        """

    def testUpdateDatasetReqPayload(self):
        """Test UpdateDatasetReqPayload"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()
