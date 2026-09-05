# Your Observability Platform Should Be a Materialized View

The log you delete to make this month’s bill smaller might be the one you need next month. I think the observability stack has its source of truth backwards.

Telemetry has an awkward value distribution. Some of it earns its keep every minute: it powers a monitor, fills a dashboard, or answers a question somebody asks several times a day. Much of the rest waits. An event can go unread for months and still be worth having when something breaks.

Those two kinds of data need different query budgets. A monitor needs predictable latency. An investigation into an old request can tolerate a slower first result. Paying the same storage and search premium for both is a poor allocation of money.

Teams respond in familiar ways. Exclude a noisy log source. Sample more traces. Cut retention from thirty days to seven. Remove fields. Turn individual events into aggregates. Each decision makes the bill more manageable and the historical record a little less complete.

There is an industry around making these decisions. [Cribl routes telemetry to multiple destinations, including archives](https://cribl.io/demo/route/). [Edge Delta explicitly describes sending valuable telemetry to expensive monitoring destinations and the rest to cheaper storage](https://docs.edgedelta.com/in-cluster-processing/). The existence of these products is good evidence that customers want control over downstream costs. Ryo does not need to invent that pain.

The part that bothers me is the question underneath the filtering rule: will anyone ever need this?

## You find out what mattered later

Consider an ordinary line:

```
INFO connection reset peer=10.0.4.12
```

Today it looks repetitive. Three weeks later, it might connect a failing checkout request to a proxy restart and an upstream timeout. The incident supplies the context that makes the line useful. At ingest time, that context does not exist.

This is the asymmetry: telemetry’s value often becomes apparent after the event that makes it valuable. We ask engineers to make an irreversible decision before they have the information needed to make it well.

Some filtering is sensible. Nobody needs to preserve a secret accidentally written to a log, and retention should have an end. But reducing a bill should not require pretending we can reliably predict every future investigation.

I want a third option between an expensive search tier and deletion: retain the event cheaply, with enough search capability to use it when the question finally arrives.

## An archive has to answer questions

Putting logs in object storage solves a large part of the retention problem. It does not automatically solve the investigation problem.

An engineer has a trace ID, a service name, and four minutes of clock time:

```
service = checkout
trace_id = 8afd...
02:13–02:17 UTC
```

They need the matching events and enough surrounding context to understand them. If getting there means finding an old export job, restoring a dataset, and waiting for another system to ingest it, the archive is only partially useful. The bytes survived. Their usefulness during an outage did not necessarily survive with them.

This distinction sets the engineering requirement. Cold telemetry has to be usable while somebody is debugging production. Retention alone is too low a bar.

The market has already been moving toward that requirement. [Datadog Flex Logs separates storage from query compute](https://docs.datadoghq.com/logs/log_configuration/flex_logs/). [Archive Search queries archived logs directly without first rehydrating them](https://www.datadoghq.com/blog/archive-search/). Datadog’s archive configuration also distinguishes [partition attributes from lookup attributes](https://docs.datadoghq.com/logs/log_configuration/archives/): the latter can help narrow searches for specific IDs instead of scanning an entire archive.

[Elastic’s searchable snapshots](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore/searchable-snapshots) support cheaper cold and frozen tiers. [Axiom describes object-backed storage with ephemeral query workers](https://axiom.co/docs/platform-overview/architecture). And in January 2025, [Datadog acquired Quickwit](https://www.datadoghq.com/blog/datadog-acquires-quickwit/), a search engine built around the cost and scale problems of log search.

I read this as convergence on a useful principle: the amount of history you retain should not dictate how much query compute you keep running.

It also makes the competitive problem uncomfortable. Cheap search over S3 is not a sufficient company thesis anymore. Routing before Datadog is not one either. Cribl combines routing with [search in place](https://docs.cribl.io/search/). Edge Delta offers tiering and reduction. [Mezmo transforms and routes telemetry before downstream ingestion](https://www.mezmo.com/blog/the-mezmo-telemetry-pipeline-product-tour). Calling Ryo a pipeline, an S3 search engine, or a cheaper Elasticsearch would leave the important question unanswered: why should somebody operate another system?

## Make the cheap copy canonical

The architecture I want to explore starts by changing which copy we consider authoritative.

A common cost-cutting path looks roughly like this:

```
Production
    ↓
Observability platform
    ↓
Filter / sample / expire
    ↓
Maybe archive what remains
```

There are already better deployments than this. The proposal is to make the alternative the organizing principle:

```
Production
    ↓
Ryo Gateway
    ├── Full-fidelity copy → Customer's object storage
    └── Selected events   → Datadog / Splunk / etc.

Ryo Search → Queries the full-fidelity copy
```

The canonical history lives in storage the customer owns. The expensive systems receive the portions that justify their latency, dashboards, monitors, and query capabilities.

In database terms, the observability destinations become materialized views. Conceptually, one might look like this:

```sql
CREATE MATERIALIZED VIEW datadog_hot AS
SELECT *
FROM telemetry
WHERE severity >= WARN
   OR powers_monitor(event)
   OR frequently_queried(service)
   OR policy_requires_hot(event);
```

Those functions are illustrative policy, not an implemented query language. The point is the direction of ownership: start with the complete dataset, then derive the views each tool needs.

Datadog does not have to be the system of record. Datadog can be the cache.

The analogy has limits. Monitors are live dependencies; losing their input is not equivalent to a cache miss. Vendor enrichments and derived metrics may not be reconstructible from raw events alone. Rebuilding a historical view also takes time and may incur ingestion charges. The model still helps because it separates the durable event history from the systems optimized to do particular work with it.

You keep the monitors, dashboards, APM, and incident workflow that make Datadog useful. The first change is which logs go into its expensive tiers. Splunk, Grafana Cloud, New Relic, or a SIEM can receive their own policy-selected views of the same history.

## What I mean by Ryo

Ryo is the architecture I’m working toward, not a claim that I have already solved this. Its proposed promise is straightforward: cut what you send to Datadog, preserve the telemetry, and make the excluded data searchable.

I think of it as observability insurance. A team should be able to remove a substantial amount of telemetry from an expensive tier without accepting permanent blindness in exchange. Whether that is a useful product depends on the combined economics and operational experience. Individually, its components are familiar.

**Gateway** sits on the telemetry path. I would start with OTLP, then add integrations such as Fluent Bit, Vector, the Datadog Agent, Kafka, and syslog as actual deployments require them. It duplicates and routes events, applies policy, writes the canonical copy, and forwards selected data downstream. Destination-specific transformations belong on the outgoing branches so they do not silently destroy the original record.

This is necessary plumbing. It also carries a serious obligation: bounded buffering, explicit acknowledgments, retries, backpressure, and visible delivery failures. A cheaper bill is worthless if the pipeline quietly loses the evidence it was supposed to preserve.

**Vault** is customer-owned object storage, initially S3, with GCS and Azure Blob as possible later targets. The design goal is compressed, durable data in a documented, portable format, with modest metadata overhead. The customer controls access and lifecycle policies. Full fidelity means preserving accepted telemetry within those policies; it cannot mean recovering spans an upstream agent already sampled away, or keeping everything forever regardless of privacy requirements.

**Search** makes that copy useful. The first queries are practical: a service, namespace, container, request ID, trace ID, or a phrase such as “connection reset,” bounded by time. The goal is that an SRE will actually use it during an incident. I have no measured basis here for promising a hundred gigabytes in one second. Latency, scan cost, concurrency, and the amount of context returned all need benchmarks on realistic workloads.

An earlier version of my thinking placed too much weight on having no inverted index. I no longer think that is a useful constraint. Bloom filters, min/max metadata, zone maps, column statistics, sparse indexes, ID lookups, selective inverted indexes, and caching are all available tools. If a small structure makes a common incident query much cheaper, use it.

The constraint worth defending is economic: keeping more history should not force the customer to maintain a large, always-on search cluster proportional to retained volume. Index maintenance and metadata still count toward the bill. So do object requests, query compute, transfer costs, and operating the gateway.

Ryo’s own pricing would have to preserve that advantage. Replacing one expensive per-byte toll with another would defeat the purpose. I do not have a final price sheet; the test is net savings after every new cost, including the customer’s time. Lower ingestion also has to translate into a lower invoice, which may take a contract renewal rather than a routing change.

## The first customer, and the test

I would start with a cloud-native organization on AWS, using Kubernetes and microservices, with a substantial Datadog bill and a platform or SRE team. Roughly fifty to five hundred engineers, perhaps more. The headcount is a prospecting hypothesis, not a law. The stronger signal is that the team already uses exclusions, sampling, short retention, or an archive because its current bill hurts.

The person willing to try this is probably a senior or staff platform engineer, an observability lead, or an SRE lead. The person approving the spend may run infrastructure or engineering, with FinOps involved. The trigger is concrete: “We need to cut Datadog spend by thirty percent.” The proposal should let them route less to Datadog without undertaking a migration.

My product-market-fit hypothesis is that these teams will put a lightweight layer in their telemetry path if it materially reduces downstream costs while preserving full-fidelity data and making excluded events interactively searchable.

That predicts things we can measure in a pilot:

- A meaningful fraction of telemetry can leave the hot tier without breaking monitors or dashboards.
- The actual savings exceed storage, search, gateway, and operating costs.
- Deployment preserves the existing workflow and demands little ongoing care.
- Delivery accounting demonstrates that accepted telemetry is retained, with failures exposed rather than hidden.
- Engineers run useful searches against data available only through Ryo.

There is no honest universal percentage for how much can move. Nor is “unqueried” a synonym for “useless.” Both the volume and the safety of diversion need to be established with customers.

The strongest result would be an engineer resolving a real incident using data that would otherwise have been discarded. A cost report demonstrates savings. That incident demonstrates why keeping the second path mattered.

The comparison must include using Datadog’s own archive capabilities, or assembling a pipeline and search product that already exists. If either solves the customer’s problem more simply and cheaply, Ryo has not earned the deployment. Combining familiar components is an architectural thesis. Making the combination reliably better is the company’s work.

## Start by looking at the bill

Before asking for a place in production, I want Ryo Advisor to examine how the existing system is used.

Which sources produce the most bytes? Which get queried? Which have gone unqueried for thirty, sixty, or ninety days? What powers a monitor or dashboard? Which fields appear in searches? What is still indexed because nobody feels confident enough to remove it?

An illustrative finding might look like this:

```
Source:                checkout INFO
Volume:                8.4 TB/month
Queries in 30 days:     17
Known monitor users:   none
Known dashboard users: none
Candidate policy:      Vault only
```

Those are made-up numbers, not a customer result. A real recommendation would include a savings estimate based on the customer’s contract, the evidence behind it, and what Advisor could not establish. Seventeen queries still represent demand. Somebody needs to check what those searches were doing and whether Ryo can serve them well enough.

Usage visibility will be incomplete. API access, saved queries, dashboards, and monitor definitions reveal different parts of the picture. Missing evidence must not become automatic permission to demote a source. Advisor should begin with recommendations an engineer can inspect, a trial period, and a straightforward rollback.

This gives the first conversation something tangible: here is where the money goes, here is a candidate change, and here is how we will check it. Asking somebody to install a new database before establishing any of that is a much harder sale.

## Placement should follow use

Initially, humans would write the routing policies. Over time, Ryo could see both what the system produces and what people depend on. That is the basis for recommending placement continuously.

A frequently queried source that powers monitors belongs in a fast tier. An occasionally queried source may suit Flex or an equivalent. Rarely consulted history can remain in the Vault. Data that reaches the end of its retention policy can expire. Each move has to respect latency requirements, dependencies, and retention obligations as well as query frequency.

The question becomes: is this data in the cheapest tier that still supports the work it needs to do?

That is the longer-term product hypothesis. Advisor would connect observed use to placement, then measure the result. Automation should follow evidence that the recommendations are safe. There is no reason to assume other pipeline vendors cannot pursue the same idea; better decisions and a better feedback loop would have to be demonstrated.

## Why this is worth trying now

Object storage gives this design an affordable place to retain history. Systems such as Axiom show that retained volume and continuously provisioned search capacity can be separated. [OpenTelemetry’s vendor-neutral collection and export model](https://opentelemetry.io/docs/) offers a more practical insertion point than a world composed entirely of proprietary agents and protocols. It reduces collection lock-in, even though dashboards, semantics, and workflows still require integration work.

Meanwhile, the incumbent products described above are making cold search a normal expectation. That raises the bar for Ryo and makes the architectural argument easier to explain. Customers should not have to be persuaded that less frequently accessed telemetry deserves different economics.

The first useful version is narrow: reduce Datadog log spend without losing the logs. If that works, extend the same treatment to traces and events, and use observed demand to improve placement. The longer-term possibility is a vendor-neutral telemetry data plane: the system’s canonical history lives underneath the tools used to investigate it.

Observability products, security tools, developers, incident tooling, and eventually automated investigators could all use that history, provided the interfaces and access controls support them. If agents begin investigating production continuously, deep historical context may become more valuable. It will also make query cost harder to ignore. More readers strengthen the case for separating storage from compute; they do not make compute free.

There is plenty left to prove. I think the starting principle is sound: you should not have to know which log will save you before the incident happens.

Store everything cheaply. Pay for speed selectively.
