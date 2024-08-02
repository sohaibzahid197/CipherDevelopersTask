import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import './AddTaxForm.css';

const apiResponse = [
  { "id": 14864, "tab_id": 3202, "name": "Recurring Item", "amount": 12.0, "amount_type": "fixed", "deleted_at": null, "required": false, "type": "TabItem", "category": null, "images": [], "options": { "recurring": { "enabled": true, "options": { "ends": { "type": "never" }, "start": { "type": "first_payment" }, "repeatInterval": "P1M" } } }, "quantity_sold": 2, "amount_sold": 24.0, "net_amount": 24.0, "net_quantity": 2 },
  { "id": 14865, "tab_id": 3202, "name": "Jasinthe Bracelet", "amount": 26.0, "amount_type": "fixed", "deleted_at": null, "required": false, "type": "TabItem", "category": { "id": 14866, "name": "Bracelets" }, "images": [{ "id": 5572, "url": "https://images.cheddarcdn.com/jasinthe_bracelet.jpg" }], "quantity_sold": 11, "amount_sold": 286.0, "net_amount": 286.0, "net_quantity": 11 },
  { "id": 14866, "tab_id": 3202, "name": "Jasinthe Bracelet", "amount": 26.0, "amount_type": "fixed", "deleted_at": null, "required": false, "type": "TabItem", "category": { "id": 14866, "name": "Bracelets" }, "images": [{ "id": 5571, "url": "https://images.cheddarcdn.com/jasinthe_bracelet.jpg" }], "quantity_sold": 1, "amount_sold": 26.0, "net_amount": 20.8, "net_quantity": 1 },
  { "id": 14867, "tab_id": 3202, "name": "Inspire Bracelet", "amount": 32.0, "amount_type": "fixed", "deleted_at": null, "required": false, "type": "TabItem", "category": { "id": 14866, "name": "Bracelets" }, "images": [{ "id": 5570, "url": "https://images.cheddarcdn.com/inspire_bracelet.jpg" }], "quantity_sold": 0, "amount_sold": 0.0, "net_amount": 0.0, "net_quantity": 0 },
  { "id": 14868, "tab_id": 3202, "name": "Zero amount item with questions", "amount": 0.0, "amount_type": "fixed", "deleted_at": null, "required": false, "type": "TabItem", "category": null, "images": [], "quantity_sold": 2, "amount_sold": 0.0, "net_amount": 0.0, "net_quantity": 2 },
  { "id": 14869, "tab_id": 3202, "name": "normal item", "amount": 0.0, "amount_type": "fixed", "deleted_at": null, "required": false, "type": "TabItem", "category": null, "images": [], "quantity_sold": 2, "amount_sold": 0.0, "net_amount": 0.0, "net_quantity": 2 },
];

const categorizeItems = (items) => {
  const categories = {};
  const uncategorized = [];
  items.forEach((item) => {
    if (item.category) {
      if (!categories[item.category.name]) {
        categories[item.category.name] = [];
      }
      categories[item.category.name].push(item);
    } else {
      uncategorized.push(item);
    }
  });
  return { categories, uncategorized };
};

const AddTaxForm = () => {
  const [applyToAll, setApplyToAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const { categories, uncategorized } = categorizeItems(apiResponse);

  const handleApplyToAllChange = () => {
    setApplyToAll(!applyToAll);
    if (!applyToAll) {
      const allSelected = {};
      apiResponse.forEach((item) => {
        allSelected[item.id] = true;
      });
      setSelectedItems(allSelected);
    } else {
      setSelectedItems({});
    }
  };

  const handleItemChange = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCategoryChange = (categoryName) => {
    const categoryItems = categories[categoryName];
    const allSelected = categoryItems.every((item) => selectedItems[item.id]);

    const updatedSelection = { ...selectedItems };
    categoryItems.forEach((item) => {
      updatedSelection[item.id] = !allSelected;
    });

    setSelectedItems(updatedSelection);
  };

  const filteredItems = (items) =>
    items.filter((item) =>
      item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const validationSchema = Yup.object().shape({
    taxName: Yup.string().required('Tax Name is required'),
    taxRate: Yup.number().min(0, 'Rate must be greater than or equal to 0').required('Tax Rate is required'),
  });

  return (
    <Formik
      initialValues={{ taxName: '', taxRate: '' }}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        const applicableItems = Object.keys(selectedItems).filter((id) => selectedItems[id]);
        console.log({
          ...values,
          applied_to: applyToAll ? 'all' : 'some',
          applicable_items: applicableItems,
        });
        resetForm();
        setApplyToAll(false);
        setSelectedItems({});
        setSearchTerm('');
      }}
    >
      {({ values, handleChange, handleSubmit, errors, touched }) => (
        <Form onSubmit={handleSubmit} className="add-tax-form">
          <h2>Add Tax</h2>
          <div className="form-group-inline">
            <div className="form-group">
              <Field
                type="text"
                name="taxName"
                value={values.taxName}
                onChange={handleChange}
                placeholder="Tax Name"
                className="tax-input"
                required
              />
              {errors.taxName && touched.taxName ? (
                <div className="error">{errors.taxName}</div>
              ) : null}
            </div>
            <div className="form-group tax-rate-group">
              <Field
                type="number"
                name="taxRate"
                value={values.taxRate}
                onChange={handleChange}
                placeholder="4"
                className="tax-rate-field"
                min="0"
                step="0.01"
                required
              />
              <span className="percent-sign">%</span>
              {errors.taxRate && touched.taxRate ? (
                <div className="error">{errors.taxRate}</div>
              ) : null}
            </div>
          </div>
          <div className="form-group">
            <label>
              <Field
                type="radio"
                name="applyToAll"
                checked={applyToAll}
                onChange={handleApplyToAllChange}
              />
              Apply to all items in collection
            </label>
            <label>
              <Field
                type="radio"
                name="applyToSpecific"
                checked={!applyToAll}
                onChange={handleApplyToAllChange}
              />
              Apply to specific items
            </label>
          </div>
          {!applyToAll && (
            <div className="form-group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Items"
                className="search-input"
              />
              {Object.keys(categories).map((category) => (
                <div key={category}>
                  <label className="category-label">
                    <input
                      type="checkbox"
                      checked={categories[category].every((item) => selectedItems[item.id])}
                      onChange={() => handleCategoryChange(category)}
                    />
                    {category}
                  </label>
                  <div className="items-group">
                    {filteredItems(categories[category]).map((item) => (
                      <label key={item.id} style={{ display: 'block' }}>
                        <input
                          type="checkbox"
                          checked={selectedItems[item.id] || false}
                          onChange={() => handleItemChange(item.id)}
                        />
                        {item.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {uncategorized.length > 0 && (
                <div>
                  <label className="category-label">Uncategorized</label>
                  <div className="items-group">
                    {filteredItems(uncategorized).map((item) => (
                      <label key={item.id} style={{ display: 'block' }}>
                        <input
                          type="checkbox"
                          checked={selectedItems[item.id] || false}
                          onChange={() => handleItemChange(item.id)}
                        />
                        {item.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button type="submit" className="apply-button">
            Apply tax to {applyToAll ? apiResponse.length : Object.values(selectedItems).filter(Boolean).length} item(s)
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default AddTaxForm;
