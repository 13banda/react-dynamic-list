import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import "./index.css";
import { Form, Input, Icon, Button, List, Select, AutoComplete } from "antd";

const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;

class DynamicFieldList extends React.Component {
  state = {
    isNewMounted: 0,
    isEnter: false,
    isStartFieldVisible: true,
    privateDataSource: [
      { text: "Another Patient", value: "Another Patient" },
      { text: "Google", value: "Google" },
      { text: "Just Dial", value: "Just Dial" }
    ],
    dataSource: []
  };
  handleFilter = (input, option) => {
    return (
      option.key
        .trim()
        .toLowerCase()
        .indexOf(input.trim().toLowerCase()) >= 0
    );
  };
  handleKeyPress = (ev, index, fieldName) => {
    ev.preventDefault();
    const { form } = this.props;
    // can use data-binding to get
    // block the use if nothing typed
    const fieldvalue = form.getFieldValue(fieldName);
    if (fieldvalue && fieldvalue.length > 1) {
      this.add(index);
      this.setState({ isEnter: true });
    }
  };
  handleBlur = (fieldName, index, k) => {
    // Remove the item ig it's value is empety when blur
    // check the it's value
    const { form } = this.props;
    // can use data-binding to get
    // block the use if nothing typed
    // nautral the dataSource
    let updateState = {
      dataSource: [],
      isStartFieldVisible: true
    };
    const fieldvalue = form.getFieldValue(fieldName);
    if (!fieldvalue || fieldvalue.trim() === "") {
      this.remove(k);
      updateState.isNewMounted = -1;
    }
    this.setState(updateState);
  };
  handleSearch = value => {
    if (value.length < 3) {
      this.setState({ dataSource: [], isEnter: false });
    } else {
      const optionStore = this.state.privateDataSource;
      let option = [];
      let isMatch = false;
      optionStore.forEach((i, k) => {
        if (i.value.trim().toLowerCase() === value.trim().toLowerCase()) {
          isMatch = true;
        }
      });
      if (!isMatch) {
        if (value.trim() !== "")
          option.push({
            text: <a>{'Add "' + value + '"'}</a>,
            value: value.trim(),
            isSuggest: true
          });
        this.setState({
          dataSource: option.concat(optionStore),
          isEnter: false
        });
      } else {
        this.setState({
          dataSource: option.concat(optionStore),
          isEnter: false
        });
      }
    }
  };
  onSelect = (value, option) => {
    // Here we are using private data store to sync values
    if (option.props.children.type) {
      let options = [];
      options.push({ text: value, value: value });
      this.setState({
        privateDataSource: this.state.privateDataSource.concat(options),
        isStartFieldVisible: true,
        isEnter: false,
        dataSource: this.state.privateDataSource.concat(options)
      });
    } else {
      this.setState({ isEnter: false, isStartFieldVisible: true });
    }
  };
  remove = k => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue("keys");
    // We need at least one passenger
    //if (keys.length === 1) {
    //  return;
    // }
    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k)
    });
  };

  add = index => {
    let FoucsElementIndex;
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue("keys");
    // Check that is it init on Starter Button
    let nextKeys;
    if (keys.length === index) {
      keys.push(index);
      nextKeys = keys;
    } else {
      keys.splice(++index, 0, keys.length);
      nextKeys = keys;
    }
    FoucsElementIndex = index;
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys
    });
    this.setState({
      isStartFieldVisible: false,
      isNewMounted: FoucsElementIndex
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
      }
    });
  };

  render() {
    const { dataSource, isNewMounted } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    let children = [];
    children = dataSource.map((i, k) => (
      <Option
        key={k}
        text={i.isSuggest ? i.text : ""}
        value={i.value.toLowerCase()}
      >
        {i.text}
      </Option>
    ));

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      }
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 }
      }
    };
    getFieldDecorator("keys", { initialValue: [] });
    const keys = getFieldValue("keys");
    const formItems = keys.map((k, index) => {
      return (
        <FormItem
          style={{ margin: 0 }}
          {...formItemLayout}
          required={false}
          key={k}
        >
          {getFieldDecorator(`names[${k}]`)(
            <AutoComplete
              backfill
              autoFocus={isNewMounted === index}
              defaultOpen={false}
              optionLabelProp="value"
              dataSource={dataSource}
              style={{ width: 200 }}
              onSelect={this.onSelect}
              onSearch={this.handleSearch}
              filterOption={this.handleFilter}
              onBlur={() => this.handleBlur(`names[${k}]`, index, k)}
            >
              <TextArea
                style={{
                  boxShadow: "none",
                  resize: "none",
                  border: "none",
                  overflow: "hidden"
                }}
                autosize={{ minRows: 1, maxRows: 3 }}
                onPressEnter={ev =>
                  this.handleKeyPress(ev, index, `names[${k}]`)
                }
              />
            </AutoComplete>
          )}
        </FormItem>
      );
    });
    const { isStartFieldVisible, isEnter } = this.state;
    if (!isEnter && isStartFieldVisible)
      formItems.push(
        <FormItem className="add-content">
          <a className="add-new-content" onClick={() => this.add(keys.length)}>
            Click to Add
          </a>
        </FormItem>
      );
    return (
      <Form id="medical-profile" onSubmit={this.handleSubmit}>
        <List
          size="small"
          bordered
          className="personal-history-content"
          dataSource={formItems}
          renderItem={item => (
            <List.Item style={{ border: 0, paddingTop: 0, paddingBottom: 0 }}>
              {item}
            </List.Item>
          )}
        />
      </Form>
    );
  }
}

const WrappedDynamicFieldSet = Form.create()(DynamicFieldList);
ReactDOM.render(
  <WrappedDynamicFieldSet />,
  document.getElementById("container")
);

/*

{
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                whitespace: true,
                message: "Please input passenger's name or delete this field."
              }
            ]
          }
 */
