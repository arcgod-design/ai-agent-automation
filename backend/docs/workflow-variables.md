\# Workflow Variables \& Step Output Mapping



\## Overview



This document describes how to use workflow variables and step output references.



\## Workflow Variables



\### Defining Variables



```json

{

&#x20; "variables": {

&#x20;   "companyName": "Acme Corp",

&#x20;   "customer": {

&#x20;     "name": "John Doe",

&#x20;     "tier": "premium"

&#x20;   }

&#x20; }

}

```



\### Using Variables



```text

{{workflow.companyName}}

{{workflow.customer.name}}

{{workflow.customer.address.city}}

```



\## Step Output References



\### Step Aliases



```yaml

steps:

&#x20; - alias: lookupCustomer

&#x20;   type: http



&#x20; - alias: sendEmail

&#x20;   prompt: "Email {{steps.lookupCustomer.output.name}}"

```



\### Available Data



| Field | Description |

|---------|-------------|

| `input` | Original input |

| `prompt` | Final prompt |

| `output` | Result |

| `raw` | Raw response |

| `success` | Status |

| `timestamp` | Time |



\### Access Patterns



```text

{{steps.lookupCustomer.output.id}}

{{steps.httpRequest.output.status}}

{{steps.generateSummary.output.title}}

```



\## Backward Compatibility



```text

{{results.0.output}}

{{last.output}}

```



\## Reserved Words



The following words cannot be used as step aliases:



```text

input

output

raw

prompt

success

timestamp

last

results

workflow

steps

```



\## Example



```yaml

workflow:

&#x20; name: "Customer Support"

&#x20; variables:

&#x20;   company: "Acme Corp"



steps:

&#x20; - alias: lookupCustomer

&#x20;   type: http

&#x20;   url: "https://api.example.com/customers/{{input.id}}"



&#x20; - alias: sendEmail

&#x20;   type: email

&#x20;   to: "{{steps.lookupCustomer.output.email}}"

&#x20;   subject: "Support from {{workflow.company}}"

&#x20;   body: "Hello {{steps.lookupCustomer.output.name}}"

```



\## Troubleshooting



\### Variable Empty?



Check the variable spelling and property path.



\### Duplicate Alias?



Ensure each step alias is unique within the workflow.



\### Reserved Word?



Do not use reserved words as step aliases.

