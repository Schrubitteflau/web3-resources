import React, { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { MultiSelect } from 'primereact/multiselect';
import { Toolbar } from 'primereact/toolbar';

import RESOURCES, { RESOURCE_TYPES_ARRAY, ALL_TAGS, getColorOfTag, getLabelOfType, getColorOfType } from "../data";
import type { Resource, ResourceType } from "../data";

import "primereact/resources/themes/lara-light-indigo/theme.css"; // Theme
import "primereact/resources/primereact.min.css"; // Core
import "primeicons/primeicons.css"; // Icons


export default function ResourcesTable(): JSX.Element {
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

    useEffect(() => initFilters(), []);

    const onGlobalFilterChange: React.ChangeEventHandler<HTMLInputElement> = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        (_filters["global"] as any).value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            type: { value: null, matchMode: FilterMatchMode.IN },
            tags: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
        });
        setGlobalFilterValue("");
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

    const tagsBodyTemplate = (row: Resource) => {
        return row.tags.map((tag: string) => {
            // TODO See : https://primereact.org/chip/
            return <Tag key={tag} value={tag} style={{background: getColorOfTag(tag)}} />;
        });
    };

    const tagsFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Dropdown
            value={options.value} options={ALL_TAGS}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            itemTemplate={tagsItemTemplate}
            placeholder="Select One"
            className="p-column-filter"
            showClear
        />;
    };

    const tagsItemTemplate = (tag: string) => {
        return <Tag value={tag} style={{background: getColorOfTag(tag)}} />;
    };

    const typeBodyTemplate = ({ type }: Resource) => {
        return <Tag value={getLabelOfType(type)} style={{background: getColorOfType(type)}} />;
    }

    const typeFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <MultiSelect
                value={options.value}
                options={RESOURCE_TYPES_ARRAY}
                itemTemplate={(type: ResourceType) => <Tag value={type.label} style={{background: type.color}} />}
                onChange={(e) => {options.filterApplyCallback(e.value)}}
                optionLabel="label"
                placeholder="Any"
                className="p-column-filter"
                maxSelectedLabels={3}
            />
        );
    };

    const rightToolbarTemplate = () => {
        const href: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(RESOURCES))}`;
        return (
            <a href={href} download="resources.json">
                <Button
                    label="Export JSON" icon="pi pi-upload"
                    className="p-button-help"
                />
            </a>
        );
    };

    const header = renderHeader();

    return (
        <div className="card">
            <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

            <DataTable
                value={RESOURCES} dataKey="url"
                header={header} showGridlines
                paginator rows={10}
                style={{ minWidth: '1000px' }}
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
                    filter filterField="type" filterElement={typeFilterTemplate}
                    showFilterMenuOptions={false} filterMenuStyle={{ width: '14rem' }}
                    body={typeBodyTemplate}
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
