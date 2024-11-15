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

from trieve_py_client.models.get_events_request_body import GetEventsRequestBody

class TestGetEventsRequestBody(unittest.TestCase):
    """GetEventsRequestBody unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional) -> GetEventsRequestBody:
        """Test GetEventsRequestBody
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `GetEventsRequestBody`
        """
        model = GetEventsRequestBody()
        if include_optional:
            return GetEventsRequestBody(
                filter = {"date_range":{"gt":"2021-08-10T00:00:00Z","lt":"2021-08-11T00:00:00Z"},"event_type":"view","is_conversion":true,"metadata_filter":"path = \"value\"","user_id":"user1"},
                page = 0
            )
        else:
            return GetEventsRequestBody(
        )
        """

    def testGetEventsRequestBody(self):
        """Test GetEventsRequestBody"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()
