import {
  RAGAnalyticsFilter,
  RagQueryEvent,
  RAGSortBy,
  SortOrder,
} from "shared/types";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { createEffect, createSignal, For, Show, useContext } from "solid-js";
import { getRAGQueries } from "../../api/analytics";
import { DatasetContext } from "../../layouts/TopBarLayout";
import { usePagination } from "../../hooks/usePagination";
import { PaginationButtons } from "../PaginationButtons";
import { ChartCard } from "./ChartCard";
import { Select } from "shared/ui";

interface RagQueriesProps {
  filter: RAGAnalyticsFilter;
}

const ALL_SORT_BY: RAGSortBy[] = ["created_at", "latency", "top_score"];
const ALL_SORT_ORDER: SortOrder[] = ["asc", "desc"];

export const RagQueries = (props: RagQueriesProps) => {
  const dataset = useContext(DatasetContext);
  const pages = usePagination();
  const queryClient = useQueryClient();

  const [sortBy, setSortBy] = createSignal<RAGSortBy>("created_at");
  const [sortOrder, setSortOrder] = createSignal<SortOrder>("asc");

  createEffect(() => {
    const datasetId = dataset().dataset.id;
    const curPage = pages.page();
    void queryClient.prefetchQuery({
      queryKey: [
        "rag-queries",
        {
          page: curPage + 1,
          filter: props.filter,
          sort_by: sortBy(),
          sort_order: sortOrder(),
        },
      ],
      queryFn: async () => {
        const results = await getRAGQueries({
          datasetId,
          page: curPage + 1,
          filter: props.filter,
          sort_by: sortBy(),
          sort_order: sortOrder(),
        });
        if (results.length === 0) {
          pages.setMaxPageDiscovered(curPage);
        }
        return results;
      },
    });
  });

  const ragQueriesQuery = createQuery(() => ({
    queryKey: ["rag-queries", { page: pages.page(), filter: props.filter }],
    queryFn: () => {
      return getRAGQueries({
        datasetId: dataset().dataset.id,
        page: pages.page(),
        filter: props.filter,
      });
    },
  }));

  return (
    <ChartCard
      title="RAG Queries"
      subtitle={"All RAG messages (topic/message and generate_from_chunk)."}
      class="flex flex-col justify-between px-4"
      width={2}
      controller={
        <div class="flex gap-2">
          <Select
            class="min-w-[130px] bg-neutral-100/90"
            options={ALL_SORT_BY}
            display={formatSortBy}
            selected={sortBy()}
            onSelected={(e) => setSortBy(e)}
          />
          <Select
            class="min-w-[110px] bg-neutral-100/90"
            options={ALL_SORT_ORDER}
            display={formatSortOrder}
            selected={sortOrder()}
            onSelected={(e) => setSortOrder(e)}
          />
        </div>
      }
    >
      <div>
        <Show when={ragQueriesQuery.data?.length === 0}>
          <div class="py-8 text-center opacity-80">No Data.</div>
        </Show>
        <Show
          fallback={<div class="py-8 text-center">Loading...</div>}
          when={ragQueriesQuery.data}
        >
          {(data) => (
            <Show when={data().length > 0}>
              <div class="pt-2">
                <table class="w-full">
                  <thead>
                    <tr>
                      <th class="text-left font-semibold">Message</th>
                      <th class="text-right font-semibold">RAG Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={data()}>
                      {(rag_query_event) => {
                        return (
                          <RagQueryEventCard
                            rag_query_event={rag_query_event}
                          />
                        );
                      }}
                    </For>
                  </tbody>
                </table>
                <div class="flex justify-end pt-4">
                  <PaginationButtons size={18} pages={pages} />
                </div>
              </div>
            </Show>
          )}
        </Show>
      </div>
    </ChartCard>
  );
};

interface QueryCardProps {
  rag_query_event: RagQueryEvent;
}
const RagQueryEventCard = (props: QueryCardProps) => {
  return (
    <tr>
      <td class="w-full max-w-0 truncate">
        {props.rag_query_event.user_message}
      </td>
      <td class="text-right">{props.rag_query_event.rag_type}</td>
    </tr>
  );
};

const formatSortBy = (sortBy: RAGSortBy) => {
  switch (sortBy) {
    case "created_at":
      return "Created At";
    case "latency":
      return "Latency";
    case "top_score":
      return "Top Score";
    default:
      return sortBy;
  }
};

const formatSortOrder = (sortOrder: SortOrder) => {
  switch (sortOrder) {
    case "asc":
      return "Ascending";
    case "desc":
      return "Descending";
    default:
      return sortOrder;
  }
};
