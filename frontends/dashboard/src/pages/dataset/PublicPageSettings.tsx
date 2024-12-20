import { createSignal, createEffect, Show, useContext } from "solid-js";
import { createToast } from "../../components/ShowToasts";
import { ApiRoutes } from "../../components/Routes";
import { DatasetContext } from "../../contexts/DatasetContext";
import { UserContext } from "../../contexts/UserContext";
import { useTrieve } from "../../hooks/useTrieve";
import { createMemo } from "solid-js";
import { CopyButton } from "../../components/CopyButton";
import { FaRegularCircleQuestion } from "solid-icons/fa";
import { JsonInput, MultiStringInput, Select, Tooltip } from "shared/ui";
import { createStore } from "solid-js/store";
import { Dataset, PublicPageParameters } from "trieve-ts-sdk";
import { publicPageSearchOptionsSchema } from "../../analytics/utils/schemas/autocomplete";
import { FiExternalLink } from "solid-icons/fi";
import { createQuery } from "@tanstack/solid-query";
import { HeroPatterns } from "./HeroPatterns";

export type DatasetWithPublicPage = Dataset & {
  server_configuration: {
    PUBLIC_DATASET?: {
      extra_params: PublicPageParameters;
      enabled: boolean;
    };
  };
};

export const PublicPageSettings = () => {
  const apiHost = import.meta.env.VITE_API_HOST as unknown as string;

  const [extraParams, setExtraParams] = createStore<PublicPageParameters>({});
  const [searchOptionsError, setSearchOptionsError] = createSignal<
    string | null
  >(null);
  const [isPublic, setisPublic] = createSignal<boolean>(false);
  const [hasLoaded, setHasLoaded] = createSignal(false);

  const { datasetId } = useContext(DatasetContext);
  const { selectedOrg } = useContext(UserContext);

  const publicUrl = createMemo(() => {
    return `${apiHost.slice(0, -4)}/public_page/${datasetId()}`;
  });

  const [heroPattern, setHeroPattern] = createSignal("Blank");
  const [foregroundColor, setForegroundColor] = createSignal("#ffffff");
  const [foregroundOpacity, setForegroundOpacity] = createSignal(50);
  const [backgroundColor, setBackgroundColor] = createSignal("#ffffff");

  const trieve = useTrieve();

  createEffect(() => {
    void (
      trieve.fetch<"eject">("/api/dataset/{dataset_id}", "get", {
        datasetId: datasetId(),
      }) as Promise<DatasetWithPublicPage>
    ).then((dataset) => {
      setisPublic(!!dataset.server_configuration?.PUBLIC_DATASET?.enabled);
      setExtraParams(
        dataset?.server_configuration?.PUBLIC_DATASET?.extra_params || {},
      );

      const params =
        dataset?.server_configuration?.PUBLIC_DATASET?.extra_params;
      setHeroPattern(params?.heroPattern?.heroPatternName || "Blank");
      setForegroundColor(params?.heroPattern?.foregroundColor || "#000000");
      setForegroundOpacity(
        (params?.heroPattern?.foregroundOpacity || 0.5) * 100,
      );
      setBackgroundColor(params?.heroPattern?.backgroundColor || "#000000");

      setHasLoaded(true);
    });
  });

  const crawlSettingsQuery = createQuery(() => ({
    queryKey: ["crawl-settings", datasetId()],
    queryFn: async () => {
      const result = await trieve.fetch(
        "/api/dataset/crawl_options/{dataset_id}",
        "get",
        {
          datasetId: datasetId(),
        },
      );

      return result.crawl_options ?? null;
    },
  }));

  // If the useGroupSearch has not been manually set,
  // set to true if shopify scraping is enabled
  createEffect(() => {
    if (
      crawlSettingsQuery.data &&
      crawlSettingsQuery.data.scrape_options?.type === "shopify"
    ) {
      if (
        extraParams.useGroupSearch === null ||
        extraParams.useGroupSearch === undefined
      ) {
        setExtraParams("useGroupSearch", true);
      }
    }
  });

  const unpublishDataset = async () => {
    await trieve.fetch("/api/dataset", "put", {
      organizationId: selectedOrg().id,
      data: {
        dataset_id: datasetId(),
        server_configuration: {
          PUBLIC_DATASET: {
            enabled: false,
          },
        },
      },
    });

    createToast({
      type: "info",
      title: `Made dataset ${datasetId()} private`,
    });

    setisPublic(false);
  };

  createEffect(() => {
    const pattern = heroPattern();
    const color = foregroundColor();
    const opacity = foregroundOpacity() / 100;

    if (hasLoaded()) {
      if (pattern === "Blank") {
        setExtraParams("heroPattern", {
          heroPatternSvg: "",
          heroPatternName: "",
          foregroundColor: "#ffffff",
          foregroundOpacity: 0.5,
          backgroundColor: "#ffffff",
        });
      } else {
        const heroPattern = {
          heroPatternSvg: HeroPatterns[pattern](color, opacity),
          heroPatternName: pattern,
          foregroundColor: color,
          foregroundOpacity: opacity,
          backgroundColor: backgroundColor(),
        };

        setExtraParams("heroPattern", heroPattern);
      }
    }
  });

  const publishDataset = async () => {
    const name = `${datasetId()}-pregenerated-search-component`;
    if (!isPublic()) {
      const response = await trieve.fetch("/api/organization/api_key", "post", {
        data: {
          name: name,
          role: 0,
          dataset_ids: [datasetId()],
          scopes: ApiRoutes["Search Component Routes"],
        },
        organizationId: selectedOrg().id,
      });

      await trieve.fetch("/api/dataset", "put", {
        organizationId: selectedOrg().id,
        data: {
          dataset_id: datasetId(),
          server_configuration: {
            PUBLIC_DATASET: {
              enabled: true,
              // @ts-expect-error Object literal may only specify known properties, and 'api_key' does not exist in type 'PublicDatasetOptions'. [2353]
              api_key: response.api_key,
              extra_params: {
                ...extraParams,
              },
            },
          },
        },
      });

      createToast({
        type: "info",
        title: `Created API key for ${datasetId()} named ${name}`,
      });
    } else {
      await trieve.fetch("/api/dataset", "put", {
        organizationId: selectedOrg().id,
        data: {
          dataset_id: datasetId(),
          server_configuration: {
            PUBLIC_DATASET: {
              enabled: true,
              extra_params: {
                ...extraParams,
              },
            },
          },
        },
      });

      createToast({
        type: "info",
        title: `Updated Public settings for ${name}`,
      });
    }

    setExtraParams(extraParams);
    setisPublic(true);
  };

  return (
    <div class="rounded border border-neutral-300 bg-white p-4 shadow">
      <div class="flex items-end justify-between pb-2">
        <div>
          <h2 id="user-details-name" class="text-xl font-medium leading-6">
            Public Page
          </h2>
          <p class="mt-1 text-sm text-neutral-600">
            Expose a public page to send your share your search to others
          </p>
        </div>
      </div>
      <Show when={!isPublic()}>
        <div class="flex items-center space-x-2">
          <button
            onClick={() => {
              void publishDataset();
            }}
            class="inline-flex justify-center rounded-md bg-magenta-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-magenta-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magenta-900"
          >
            Publish Dataset
          </button>
          <Tooltip
            tooltipText="Make a UI to display the search with our component. This is revertable"
            body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
          />
        </div>
      </Show>
      <Show when={isPublic() && hasLoaded()}>
        <div class="mt-4 flex content-center items-center gap-1.5 gap-x-2.5">
          <span class="font-medium">Published Url:</span>{" "}
          <a class="text-magenta-400" href={publicUrl()} target="_blank">
            {publicUrl()}
          </a>
          <CopyButton size={15} text={publicUrl()} />
          <a
            class="cursor-pointer text-sm text-gray-500 hover:text-magenta-400"
            href={publicUrl()}
            target="_blank"
          >
            <FiExternalLink />
          </a>
        </div>
        <div class="mt-4 flex space-x-3">
          <div class="grow">
            <div class="flex items-center gap-1">
              <label class="block" for="">
                Brand Logo Link
              </label>
              <Tooltip
                tooltipText="URL for your brand's logo that will be displayed in the search component"
                body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
              />
            </div>
            <input
              placeholder="https://cdn.trieve.ai/favicon.ico"
              value={extraParams.brandLogoImgSrcUrl || ""}
              onInput={(e) => {
                setExtraParams("brandLogoImgSrcUrl", e.currentTarget.value);
              }}
              class="block w-full rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
            />
          </div>
          <div class="grow">
            <div class="flex items-center gap-1">
              <label class="block" for="">
                Brand Name
              </label>
              <Tooltip
                tooltipText="Your brand name that will be displayed in the search component"
                body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
              />
            </div>
            <input
              placeholder="Trieve"
              value={extraParams.brandName || ""}
              onInput={(e) => {
                setExtraParams("brandName", e.currentTarget.value);
              }}
              class="block w-full rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
            />
          </div>
          <div class="grow">
            <div class="flex items-center gap-1">
              <label class="block" for="">
                Color Theme
              </label>
              <Tooltip
                tooltipText="Choose between light and dark mode for the search component"
                body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
              />
            </div>
            <Select
              display={(option) =>
                option.replace(/^\w/, (c) => c.toUpperCase())
              }
              onSelected={(option) => {
                setExtraParams("theme", option as "light" | "dark");
              }}
              class="bg-white py-1"
              selected={extraParams.theme || "light"}
              options={["light", "dark"]}
            />
          </div>
          <div class="grow">
            <div class="flex items-center gap-1">
              <label class="block" for="">
                Brand Color
              </label>
              <Tooltip
                tooltipText="Hex color code for the main accent color in the search component"
                body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
              />
            </div>
            <input
              placeholder="#CB53EB"
              value={extraParams.brandColor || ""}
              onInput={(e) => {
                setExtraParams("brandColor", e.currentTarget.value);
              }}
              class="block w-full rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div class="mt-4 flex">
          <div class="flex grow">
            <div class="grow">
              <div class="flex items-center gap-1">
                <label class="block" for="">
                  Problem Link
                </label>
                <Tooltip
                  tooltipText="Contact link for users to report issues (e.g. mailto: or support URL)"
                  body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
                />
              </div>
              <input
                placeholder="mailto:humans@trieve.ai"
                value={extraParams.problemLink || ""}
                onInput={(e) => {
                  setExtraParams("problemLink", e.currentTarget.value);
                }}
                class="block w-full rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div class="ml-3 grid grow grid-cols-2 items-center gap-1.5 p-1.5">
            <div class="flex gap-2">
              <div class="flex items-center gap-1">
                <label class="block" for="">
                  Responsive View
                </label>
                <Tooltip
                  tooltipText="Enable responsive layout for different screen sizes"
                  body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
                />
              </div>
              <input
                checked={extraParams.responsive || false}
                type="checkbox"
                onInput={(e) => {
                  setExtraParams("responsive", e.currentTarget.checked);
                }}
                class="block w-4 rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
              />
            </div>
            <div class="flex gap-2">
              <div class="flex items-center gap-1">
                <label class="block" for="">
                  Analytics
                </label>
                <Tooltip
                  tooltipText="Collect analytics for searches on the page"
                  body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
                />
              </div>
              <input
                checked={extraParams.analytics || true}
                type="checkbox"
                onChange={(e) => {
                  setExtraParams("analytics", e.currentTarget.checked);
                }}
                class="block w-4 rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
              />
            </div>
            <div class="flex gap-2">
              <div class="flex items-center gap-1">
                <label class="block" for="">
                  Enable Suggestions
                </label>
                <Tooltip
                  tooltipText="Show search suggestions as users type"
                  body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
                />
              </div>
              <input
                checked={extraParams.suggestedQueries || true}
                type="checkbox"
                onChange={(e) => {
                  setExtraParams("suggestedQueries", e.currentTarget.checked);
                }}
                class="block w-4 rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
              />
            </div>
            <div class="flex gap-2">
              <div class="flex items-center gap-1">
                <label class="block" for="">
                  Enable Chat
                </label>
                <Tooltip
                  tooltipText="Enable RAG Chat in the component"
                  body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
                />
              </div>
              <input
                checked={extraParams.chat || true}
                type="checkbox"
                onChange={(e) => {
                  setExtraParams("chat", e.currentTarget.checked);
                }}
                class="block w-4 rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
              />
            </div>
            <div class="flex gap-2">
              <div class="flex items-center gap-1">
                <label class="block" for="">
                  Ecommerce Mode
                </label>
                <Tooltip
                  tooltipText="Use the component in ecommerce mode"
                  body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
                />
              </div>
              <input
                checked={extraParams.type === "ecommerce" || false}
                type="checkbox"
                onChange={(e) => {
                  setExtraParams(
                    "type",
                    e.currentTarget.checked ? "ecommerce" : "docs",
                  );
                }}
                class="block w-4 rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
              />
            </div>
            <div class="flex gap-2">
              <div class="flex items-center gap-1">
                <label class="block" for="">
                  Use Grouping
                </label>
                <Tooltip
                  tooltipText="Use search over groups instead of chunk-level search"
                  body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
                />
              </div>
              <input
                checked={extraParams.useGroupSearch || false}
                type="checkbox"
                onChange={(e) => {
                  setExtraParams("useGroupSearch", e.currentTarget.checked);
                }}
                class="block w-4 rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>

        <div class="p-2">
          <div> Search Options </div>
          <JsonInput
            onValueChange={(value) => {
              const result = publicPageSearchOptionsSchema.safeParse(value);

              if (result.success) {
                setExtraParams("searchOptions", result.data);
                setSearchOptionsError(null);
              } else {
                setSearchOptionsError(
                  result.error.errors.at(0)?.message ||
                    "Invalid Search Options",
                );
              }
            }}
            value={() => {
              return extraParams?.searchOptions || {};
            }}
            onError={(message) => {
              setSearchOptionsError(message);
            }}
          />
          <Show when={searchOptionsError()}>
            <div class="text-red-500">{searchOptionsError()}</div>
          </Show>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="grow">
            <div class="flex items-center gap-1">
              <label class="block" for="">
                Default Search Queries
              </label>
              <Tooltip
                tooltipText="Example search queries to show users"
                body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
              />
            </div>
            <MultiStringInput
              placeholder={`What is ${
                extraParams["brandName"] || "Trieve"
              }?...`}
              value={extraParams.defaultSearchQueries || []}
              onChange={(e) => {
                setExtraParams("defaultSearchQueries", e);
              }}
              addLabel="Add Example"
              addClass="text-sm"
              inputClass="block w-full rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
            />
          </div>
          <div class="grow">
            <div class="flex items-center gap-1">
              <label class="block" for="">
                Default AI Questions
              </label>
              <Tooltip
                tooltipText="Example AI questions to show in the RAG chat"
                body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
              />
            </div>
            <MultiStringInput
              placeholder={`What is ${
                extraParams["brandName"] || "Trieve"
              }?...`}
              value={extraParams.defaultAiQuestions || []}
              onChange={(e) => {
                setExtraParams("defaultAiQuestions", e);
              }}
              addLabel="Add Example"
              addClass="text-sm"
              inputClass="block w-full rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
            />
          </div>
          <div class="grow">
            <div class="flex items-center gap-1">
              <label class="block">Placeholder Text</label>
              <Tooltip
                tooltipText="Text shown in the search box before user input"
                body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
              />
            </div>
            <input
              placeholder="Search..."
              value={extraParams.placeholder || ""}
              onInput={(e) => {
                setExtraParams("placeholder", e.currentTarget.value);
              }}
              class="block w-full rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
            />
          </div>
          <div class="grow">
            <div class="flex items-center gap-1">
              <label class="block">Hero Pattern</label>
              <Tooltip
                tooltipText="Choose a hero pattern for the search component"
                body={<FaRegularCircleQuestion class="h-3 w-3 text-black" />}
              />
            </div>
            <Select
              display={(option) => option}
              onSelected={(option) => {
                setHeroPattern(option);
              }}
              class="bg-white py-1"
              selected={heroPattern()}
              options={Object.keys(HeroPatterns)}
            />
          </div>
        </div>
        <Show when={heroPattern() !== "Blank"}>
          <div class="flex flex-row items-center justify-start gap-4 pt-4">
            <div class="">
              <label class="block" for="">
                Foreground Color
              </label>
              <input
                type="color"
                onChange={(e) => {
                  setForegroundColor(e.currentTarget.value);
                }}
                value={foregroundColor()}
              />
            </div>
            <div class="">
              <label class="block" for="">
                Foreground Opacity
              </label>
              <input
                type="range"
                min="0"
                max="100"
                onChange={(e) => {
                  setForegroundOpacity(parseInt(e.currentTarget.value));
                }}
                value={foregroundOpacity()}
              />
            </div>
            <div class="">
              <Show
                when={heroPattern() !== "Blank" && heroPattern() !== "Solid"}
              >
                <label class="block" for="">
                  Background Color
                </label>
                <input
                  type="color"
                  onChange={(e) => {
                    setBackgroundColor(e.currentTarget.value);
                  }}
                  value={backgroundColor()}
                />
              </Show>
            </div>
          </div>
        </Show>
        <details class="mb-4 mt-4">
          <summary class="cursor-pointer text-sm font-medium">
            Advanced Settings
          </summary>
          <div class="mt-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="grow">
                <div class="flex items-center gap-1">
                  <label class="block" for="">
                    Default Currency
                  </label>
                  <Tooltip
                    tooltipText="Set the default currency for pricing display"
                    body={
                      <FaRegularCircleQuestion class="h-3 w-3 text-black" />
                    }
                  />
                </div>
                <input
                  placeholder="USD"
                  value={extraParams.defaultCurrency || ""}
                  onInput={(e) => {
                    setExtraParams("defaultCurrency", e.currentTarget.value);
                  }}
                  class="block w-full rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
                />
              </div>
              <div class="grow">
                <div class="flex items-center gap-1">
                  <label class="block" for="">
                    Currency Position
                  </label>
                  <Tooltip
                    tooltipText="Position of currency symbol (prefix/suffix)"
                    body={
                      <FaRegularCircleQuestion class="h-3 w-3 text-black" />
                    }
                  />
                </div>
                <Select
                  display={(option) => option}
                  onSelected={(option) => {
                    setExtraParams(
                      "currencyPosition",
                      option as "prefix" | "suffix",
                    );
                  }}
                  class="bg-white py-1"
                  selected={extraParams.currencyPosition || "prefix"}
                  options={["prefix", "suffix"]}
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="grow">
                <div class="flex items-center gap-1">
                  <label class="block" for="">
                    Default Search Mode
                  </label>
                  <Tooltip
                    tooltipText="Set the initial search mode"
                    body={
                      <FaRegularCircleQuestion class="h-3 w-3 text-black" />
                    }
                  />
                </div>
                <Select
                  display={(option) => option}
                  onSelected={(option) => {
                    setExtraParams("defaultSearchMode", option);
                  }}
                  class="bg-white py-1"
                  selected={extraParams.defaultSearchMode || "search"}
                  options={["search", "chat"]}
                />
              </div>

              <div class="grow">
                <div class="flex items-center gap-1">
                  <label class="block" for="">
                    Debounce (ms)
                  </label>
                  <Tooltip
                    tooltipText="Delay before search triggers after typing"
                    body={
                      <FaRegularCircleQuestion class="h-3 w-3 text-black" />
                    }
                  />
                </div>
                <input
                  type="number"
                  placeholder="300"
                  value={extraParams.debounceMs || 300}
                  onInput={(e) => {
                    setExtraParams(
                      "debounceMs",
                      parseInt(e.currentTarget.value),
                    );
                  }}
                  class="block w-full rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex gap-2">
                <div class="flex items-center gap-1">
                  <label class="block" for="">
                    Allow Switching Modes
                  </label>
                  <Tooltip
                    tooltipText="Enable users to switch between search modes"
                    body={
                      <FaRegularCircleQuestion class="h-3 w-3 text-black" />
                    }
                  />
                </div>
                <input
                  type="checkbox"
                  checked={extraParams.allowSwitchingModes || false}
                  onChange={(e) => {
                    setExtraParams(
                      "allowSwitchingModes",
                      e.currentTarget.checked,
                    );
                  }}
                  class="block w-4 rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
                />
              </div>

              <div class="flex gap-2">
                <div class="flex items-center gap-1">
                  <label class="block" for="">
                    Use Group Search
                  </label>
                  <Tooltip
                    tooltipText="Enable grouped search results"
                    body={
                      <FaRegularCircleQuestion class="h-3 w-3 text-black" />
                    }
                  />
                </div>
                <input
                  type="checkbox"
                  checked={extraParams.useGroupSearch || false}
                  onChange={(e) => {
                    setExtraParams("useGroupSearch", e.currentTarget.checked);
                  }}
                  class="block w-4 rounded border border-neutral-300 px-3 py-1.5 shadow-sm placeholder:text-neutral-400 focus:outline-magenta-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </details>

        <div class="space-x-1.5">
          <button
            class="inline-flex justify-center rounded-md bg-magenta-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-magenta-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magenta-900 disabled:opacity-40"
            onClick={() => {
              void publishDataset();
            }}
            disabled={searchOptionsError() !== null}
          >
            Save
          </button>
          <button
            class="inline-flex justify-center rounded-md border-2 border-magenta-500 px-3 py-2 text-sm font-semibold text-magenta-500 shadow-sm hover:bg-magenta-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magenta-900"
            onClick={() => {
              void unpublishDataset();
            }}
          >
            Make Private
          </button>
        </div>
      </Show>
    </div>
  );
};
