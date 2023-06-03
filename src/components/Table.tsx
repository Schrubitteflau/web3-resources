import React, { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { MultiSelect } from 'primereact/multiselect';

import "primereact/resources/themes/lara-light-indigo/theme.css"; // Theme
import "primereact/resources/primereact.min.css"; // Core
import "primeicons/primeicons.css"; // Icons

interface ResourceType {
    value: string;
    label: string;
}

const RESOURCE_TYPES: Array<ResourceType> = [
    {
        value: "tool",
        label: "Tool"
    }, {
        value: "platform",
        label: "Platform"
    }, {
        value: "repository",
        label: "Repository"
    }, {
        value: "article",
        label: "Article"
    }
];

interface ResourceRaw {
    url: string;
    type: string;
    description: string;
    details: string | null;
    tags: Array<string>;
}

interface Resource {
    url: string;
    type: ResourceType;
    description: string;
    details: string | null;
    tags: Array<string>;
}

const RESOURCES: Array<ResourceRaw> = [
    {
        "url": "https://chainlist.org/",
        "type": "tool",
        "description": "Helping users connect to EVM powered networks",
        "details": null,
        "tags": ["evm", "other"]
    },
    {
        "url": "https://ethernaut.openzeppelin.com/",
        "type": "platform",
        "description": "Web3/Solidity based wargame inspired by overthewire.org",
        "details": null,
        "tags": ["evm", "security", "ctf"]
    }
];

function mapBy<T extends {}, U extends keyof T>(data: Array<T>, key: U): Record<string, T> {
    const ret: any = {};
    for (const element of data) {
        ret[element[key]] = element;
    }
    return ret;
}

function transformData(rawResources: Array<ResourceRaw>): Array<any> {
    const mappedResourceTypes = mapBy(RESOURCE_TYPES, "value");

    const r = rawResources.map((value: ResourceRaw) => {
        return {
            ...value,
            type: mappedResourceTypes[value.type]
        };
    });
    console.log(r)
    return r
}

export default function AdvancedFilterDemo() {
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const allTags = ['evm', 'security', 'ctf', 'other'];

    useEffect(() => {
        initFilters();
    }, []);

    const onGlobalFilterChange: React.ChangeEventHandler<HTMLInputElement> = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        (_filters['global'] as any).value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            "type.value": { value: null, matchMode: FilterMatchMode.IN },
            tags: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        });
        setGlobalFilterValue('');
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={initFilters} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </span>
            </div>
        );
    };

    const tagsBodyTemplate = (rowData: Resource) => {
        return rowData.tags.map(tag => {
            return <Tag key={tag} value={tag} severity={'danger'} />;
        });
    };

    const tagsFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Dropdown
            value={options.value} options={allTags}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            itemTemplate={tagsItemTemplate}
            placeholder="Select One"
            className="p-column-filter"
            showClear
        />;
    };

    const tagsItemTemplate = (tag: string) => {
        return <Tag value={tag} severity={'danger'} />;
    };

    const typeFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <MultiSelect
                value={options.value}
                options={RESOURCE_TYPES}
                itemTemplate={(type: ResourceType) => <div className="flex align-items-center gap-2"><span>{type.label}</span></div>}
                onChange={(e) => {options.filterApplyCallback(e.value)}}
                optionLabel="label"
                placeholder="Any"
                className="p-column-filter"
                maxSelectedLabels={3}
                style={{ minWidth: '14rem' }}
            />
        );
    };

    const header = renderHeader();

    return (
        <div className="card">
            <DataTable
                value={transformData(RESOURCES)} dataKey="url"
                header={header} showGridlines
                paginator rows={10}
                filters={filters} filterDisplay="menu" globalFilterFields={["url", "description"]}
                emptyMessage="No resource found."
            >

                <Column
                    field="url" header="URL"
                    filter filterPlaceholder="Search by URL"
                    showFilterMenu={false}
                    style={{ minWidth: '12rem', width: '25%' }}
                />

                <Column
                    field="description" header="Description"
                    filter filterPlaceholder="Search by description"
                    showFilterMenu={false}
                    style={{ minWidth: '14rem', width: '25%' }}
                />

                <Column
                    field="type" header="Type"
                    filter filterField="type.value" filterElement={typeFilterTemplate}
                    showFilterMenuOptions={false} filterMenuStyle={{ width: '14rem' }}
                    body={(r) => <div className="flex align-items-center gap-2"><span>{r.type.label}</span></div>}
                    style={{ minWidth: '14rem', width: '25%' }}
                />

                <Column
                    field="tags" header="Tags"
                    filter filterField="tags" filterElement={tagsFilterTemplate}
                    filterMenuStyle={{ width: '14rem' }}
                    body={tagsBodyTemplate}
                    style={{ minWidth: '12rem', width: '25%' }}
                />
            </DataTable>
        </div>
    );
}
