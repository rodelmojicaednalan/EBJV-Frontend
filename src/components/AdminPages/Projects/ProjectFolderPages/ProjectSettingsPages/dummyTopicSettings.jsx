import React from "react";
import { RiEdit2Fill, RiErrorWarningFill  } from "react-icons/ri";
import { IoIosListBox } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FiChevronDown } from "react-icons/fi";
import { BsCircleFill, BsFillInfoCircleFill  } from "react-icons/bs";
import { SketchPicker } from 'react-color';

import { FaComments, FaPen, FaBug   } from "react-icons/fa";

import { IoShieldCheckmarkSharp, IoWarningSharp, IoBookmarkSharp  } from "react-icons/io5";
import { GrStatusUnknown } from "react-icons/gr";

const sampleData1 = [
  {
    id: 1,
    icon: <span style={{cursor:"pointer"}}> <GrStatusUnknown color="black" size={24}/> <FiChevronDown/></span>,
    type: "Undefined",
    action: "Action1",
  },
  {
    id: 2,
    icon: <span style={{cursor:"pointer"}}> <FaComments size={24} color="royalBlue"/> <FiChevronDown/></span>,
    type: "Comment",
    action: "Action1",
  },
  {
    id: 3,
    icon: <span style={{cursor:"pointer"}}> <IoShieldCheckmarkSharp color="darkGreen" size={24}/> <FiChevronDown/></span>,
    type: "Solution",
    action: "Action1",
  },
  {
    id: 4,
    icon: <span style={{cursor:"pointer"}}> <IoWarningSharp color="crimson" size={24}/> <FiChevronDown/></span>,
    type: "Fault",
    action: "Action1",
  },
  {
    id: 5,
    icon: <span style={{cursor:"pointer"}}> <RiErrorWarningFill color="crimson" size={24}/> <FiChevronDown/></span>,
    type: "Issue",
    action: "Action1",
  },
  {
    id: 6,
    icon: <span style={{cursor:"pointer"}}> <IoIosListBox color="teal" size={24}/> <FiChevronDown/></span>,
    type: "Request",
    action: "Action1",
  },
  {
    id: 7,
    icon: <span style={{cursor:"pointer"}}> <BsFillInfoCircleFill color="royalBlue" size={24}/> <FiChevronDown/></span>,
    type: "Inquiry",
    action: "Action1",
  },
  {
    id: 8,
    icon: <span style={{cursor:"pointer"}}> <FaPen color="grey" size={24}/> <FiChevronDown/></span>,
    type: "Remark",
    action: "Action1",
  },
  {
    id: 9,
    icon: <span style={{cursor:"pointer"}}> <FaBug color="black" size={24}/> <FiChevronDown/></span>,
    type: "Clash",
    action: "Action1",
  },
];

const sampleColumns1 = [
  {
    name: "Icon",
    width: "15%",
    selector: (row) => row.icon,
    onclick: "",
    sortable: false,
  },
  {
    name: "Type",
    width: "70%",
    selector: (row) => row.type,
    sortable: true,
  },
  {
    name: "Actions",
    selector: (row) => (
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-outline p-1" title="Edit">
          <RiEdit2Fill className="action-btn" />
        </button>
        <button className="btn btn-outline p-1" title="Delete">
          <RxCross2 className="action-btn" />
        </button>
      </div>
    ),
    sortable: false,
  },
];

const sampleData2 = [
  {
    id: 1,
    default: <input type="radio" name="default" />,
    active: <input type="checkbox" defaultChecked />,
    color: (
      <span style={{ cursor: "pointer" }}>
        <BsCircleFill color="crimson" size={18} /> <FiChevronDown />
      </span>
    ),
    status: "Closed",
  },
  {
    id: 2,
    default: <input type="radio" name="default" />,
    active: <input type="checkbox" />,
    color: (
      <span style={{ cursor: "pointer" }}>
        <BsCircleFill color="royalBlue" size={18} /> <FiChevronDown />
      </span>
    ),
    status: "New",
  },
  {
    id: 3,
    default: <input type="radio" name="default"  />,
    active: <input type="checkbox" defaultChecked />,
    color: (
      <span style={{ cursor: "pointer" }}>
        <BsCircleFill color="darkGreen" size={18} /> <FiChevronDown />
      </span>
    ),
    status: "In Progress",
  },
  {
    id: 4,
    default: <input type="radio" name="default" />,
    active: <input type="checkbox" />,
    color: (
      <span style={{ cursor: "pointer" }}>
        <BsCircleFill color="orange" size={18} /> <FiChevronDown />
      </span>
    ),
    status: "Pending",
  },
  {
    id: 5,
    default: <input type="radio" name="default" />,
    active: <input type="checkbox" />,
    color: (
      <span style={{ cursor: "pointer" }}>
        <BsCircleFill color="blue" size={18} /> <FiChevronDown />
      </span>
    ),
    status: "Done",
  },
];

const sampleColumns2 = [
  {
    name: "Default",
    width: "15%",
    selector: (row) => row.default,
    sortable: false,
  },
  {
    name: "Active",
    width: "15%",
    selector: (row) => row.active,
    sortable: false,
  },
  {
    name: "Color",
    width: "15%",
    selector: (row) => row.color,
    sortable: false,
  },
  {
    name: "Status",
    width: "40%",
    selector: (row) => row.status,
    sortable: true,
  },
  {
    name: "Actions",
    selector: (row) => (
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-outline p-1" title="Edit">
          <RiEdit2Fill className="action-btn" />
        </button>
        <button className="btn btn-outline p-1" title="Delete">
          <RxCross2 className="action-btn" />
        </button>
      </div>
    ),
    sortable: false,
  },
];


const sampleData3 = [
  {
    id: 1,
    icon: <span style={{cursor:"pointer"}}> <IoBookmarkSharp color="royalBlue" size={18}/> <FiChevronDown/></span>,
    priority: "Low",
    action: "Action1",
  },
  {
    id: 2,
    icon: <span style={{cursor:"pointer"}}> <IoBookmarkSharp size={18} color="darkGreen"/> <FiChevronDown/></span>,
    priority: "Normal",
    action: "Action1",
  },
  {
    id: 3,
    icon: <span style={{cursor:"pointer"}}> <IoBookmarkSharp color="orange" size={18}/> <FiChevronDown/></span>,
    priority: "High",
    action: "Action1",
  },
  {
    id: 4,
    icon: <span style={{cursor:"pointer"}}> <IoBookmarkSharp color="crimson" size={18}/> <FiChevronDown/></span>,
    priority: "Critical",
    action: "Action1",
  },
];

const sampleColumns3 = [
  {
    name: "Icon",
    width: "15%",
    selector: (row) => row.icon,
    onclick: "",
    sortable: false,
  },
  {
    name: "Priority",
    width: "70%",
    selector: (row) => row.priority,
    sortable: true,
  },
  {
    name: "Actions",
    selector: (row) => (
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-outline p-1" title="Edit">
          <RiEdit2Fill className="action-btn" />
        </button>
        <button className="btn btn-outline p-1" title="Delete">
          <RxCross2 className="action-btn" />
        </button>
      </div>
    ),
    sortable: false,
  },
];


export {
  sampleData1, sampleColumns1, 
  sampleData2, sampleColumns2, 
  sampleData3, sampleColumns3

};
