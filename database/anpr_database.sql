--
-- PostgreSQL database dump
--

\restrict ILw9QqXY6yHLlCVXfNvjR3Zmpg595eaRCx3Ii23fLG2cVVONd90xgMNPOx9SBJz

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-19 05:53:04

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 20245)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 896 (class 1247 OID 24178)
-- Name: account_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'rejected',
    'inactive'
);


ALTER TYPE public.account_status OWNER TO postgres;

--
-- TOC entry 926 (class 1247 OID 24276)
-- Name: anpr_alert_kind; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.anpr_alert_kind AS ENUM (
    'access',
    'anomaly_unregistered',
    'anomaly_low_confidence',
    'anomaly_rapid_movement',
    'anomaly_frequent_unregistered',
    'breach_blacklisted',
    'breach_expired',
    'breach_rejected'
);


ALTER TYPE public.anpr_alert_kind OWNER TO postgres;

--
-- TOC entry 917 (class 1247 OID 24250)
-- Name: camera_recording_mode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.camera_recording_mode AS ENUM (
    'always',
    'motion',
    'plate'
);


ALTER TYPE public.camera_recording_mode OWNER TO postgres;

--
-- TOC entry 914 (class 1247 OID 24242)
-- Name: duty_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.duty_status AS ENUM (
    'on_duty',
    'standby',
    'off_duty'
);


ALTER TYPE public.duty_status OWNER TO postgres;

--
-- TOC entry 905 (class 1247 OID 24214)
-- Name: entry_direction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.entry_direction AS ENUM (
    'entry',
    'exit'
);


ALTER TYPE public.entry_direction OWNER TO postgres;

--
-- TOC entry 911 (class 1247 OID 24234)
-- Name: gate_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gate_status AS ENUM (
    'open',
    'closed',
    'maintenance'
);


ALTER TYPE public.gate_status OWNER TO postgres;

--
-- TOC entry 920 (class 1247 OID 24258)
-- Name: log_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.log_category AS ENUM (
    'entry',
    'exit',
    'alert',
    'system'
);


ALTER TYPE public.log_category OWNER TO postgres;

--
-- TOC entry 884 (class 1247 OID 20322)
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'INFO',
    'SUCCESS',
    'WARNING',
    'DANGER'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- TOC entry 923 (class 1247 OID 24268)
-- Name: sex_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sex_type AS ENUM (
    'Male',
    'Female',
    'Other'
);


ALTER TYPE public.sex_type OWNER TO postgres;

--
-- TOC entry 893 (class 1247 OID 24165)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'student',
    'faculty',
    'staff',
    'security',
    'visitor'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 899 (class 1247 OID 24190)
-- Name: vehicle_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vehicle_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'blacklisted',
    'expired'
);


ALTER TYPE public.vehicle_status OWNER TO postgres;

--
-- TOC entry 902 (class 1247 OID 24202)
-- Name: vehicle_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vehicle_type AS ENUM (
    'car',
    'motorcycle',
    'van',
    'truck',
    'other'
);


ALTER TYPE public.vehicle_type OWNER TO postgres;

--
-- TOC entry 908 (class 1247 OID 24220)
-- Name: violation_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.violation_type AS ENUM (
    'unregistered',
    'blacklisted',
    'speeding',
    'wrong_way',
    'unauthorized_access',
    'expired_registration'
);


ALTER TYPE public.violation_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 24617)
-- Name: anpr_anomaly_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.anpr_anomaly_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    capture_id uuid NOT NULL,
    kind public.anpr_alert_kind NOT NULL,
    status character varying(20) DEFAULT 'open'::character varying,
    notes text,
    tags jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.anpr_anomaly_events OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 20402)
-- Name: anpr_camera_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.anpr_camera_config (
    id integer NOT NULL,
    camera_id integer NOT NULL,
    camera_name character varying(100) NOT NULL,
    camera_type character varying(20) NOT NULL,
    camera_source character varying(255) NOT NULL,
    location character varying(100),
    gate_id character varying(50),
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_active boolean DEFAULT true,
    frame_width integer DEFAULT 1920,
    frame_height integer DEFAULT 1080,
    fps integer DEFAULT 30,
    resolution character varying(20),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT anpr_camera_config_camera_type_check CHECK (((camera_type)::text = ANY (ARRAY[('usb'::character varying)::text, ('rtsp'::character varying)::text, ('file'::character varying)::text])))
);


ALTER TABLE public.anpr_camera_config OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 20419)
-- Name: anpr_camera_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.anpr_camera_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.anpr_camera_config_id_seq OWNER TO postgres;

--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 221
-- Name: anpr_camera_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.anpr_camera_config_id_seq OWNED BY public.anpr_camera_config.id;


--
-- TOC entry 236 (class 1259 OID 24578)
-- Name: anpr_plate_captures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.anpr_plate_captures (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    plate_normalized character varying(20) NOT NULL,
    plate_raw character varying(40),
    confidence_score numeric(5,2),
    brand character varying(80),
    color character varying(80),
    vehicle_type_detected character varying(50),
    camera_id uuid,
    gate_id uuid,
    vehicle_id uuid,
    recorded_by uuid,
    alert_kind public.anpr_alert_kind NOT NULL,
    payload jsonb,
    entry_log_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.anpr_plate_captures OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24382)
-- Name: blacklist_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blacklist_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    vehicle_id uuid,
    reason text NOT NULL,
    added_by uuid,
    start_date timestamp with time zone DEFAULT now(),
    end_date timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.blacklist_records OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 24479)
-- Name: camera_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camera_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    camera_id uuid,
    detection_threshold integer DEFAULT 85,
    recording_mode public.camera_recording_mode DEFAULT 'motion'::public.camera_recording_mode,
    ai_night_vision boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT camera_settings_detection_threshold_check CHECK (((detection_threshold >= 0) AND (detection_threshold <= 100)))
);


ALTER TABLE public.camera_settings OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 24459)
-- Name: cameras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cameras (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    gate_id uuid,
    name character varying(100) NOT NULL,
    "position" character varying(50),
    ip_address character varying(45),
    stream_url text,
    direction public.entry_direction DEFAULT 'entry'::public.entry_direction,
    is_active boolean DEFAULT true,
    is_streaming boolean DEFAULT false,
    last_plate_detected character varying(20),
    last_plate_detected_at timestamp with time zone,
    offline_since timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cameras OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 20464)
-- Name: detected_vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detected_vehicles (
    id integer NOT NULL,
    detection_id character varying(50) NOT NULL,
    camera_id integer NOT NULL,
    plate_number character varying(20),
    plate_confidence double precision,
    vehicle_type character varying(30),
    vehicle_brand character varying(50),
    vehicle_model character varying(50),
    vehicle_color character varying(30),
    detection_model character varying(20),
    detection_confidence double precision,
    ocr_model character varying(20),
    ocr_confidence double precision,
    frame_timestamp timestamp without time zone NOT NULL,
    detection_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_path character varying(255),
    plate_image_path character varying(255),
    raw_ocr_text character varying(100),
    normalized_plate_text character varying(20),
    is_authorized boolean,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.detected_vehicles OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 20475)
-- Name: detected_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detected_vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detected_vehicles_id_seq OWNER TO postgres;

--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 223
-- Name: detected_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detected_vehicles_id_seq OWNED BY public.detected_vehicles.id;


--
-- TOC entry 234 (class 1259 OID 24516)
-- Name: duty_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.duty_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    shift_id uuid,
    user_id uuid,
    clock_in timestamp with time zone,
    clock_out timestamp with time zone,
    vehicles_logged integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.duty_logs OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 24537)
-- Name: entry_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entry_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    camera_id uuid,
    gate_id uuid,
    detected_plate_number character varying(20) NOT NULL,
    vehicle_id uuid,
    user_id uuid,
    "timestamp" timestamp with time zone DEFAULT now(),
    direction public.entry_direction NOT NULL,
    category public.log_category DEFAULT 'entry'::public.log_category,
    confidence_score numeric(5,2),
    snapshot_image_url text,
    authorization_status character varying(30) DEFAULT 'authorized'::character varying,
    is_violation boolean DEFAULT false,
    requires_manual_verification boolean DEFAULT false
);


ALTER TABLE public.entry_logs OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 24442)
-- Name: gates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    location_description text,
    status public.gate_status DEFAULT 'open'::public.gate_status,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.gates OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 24666)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type character varying(20) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24326)
-- Name: ocr_scans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ocr_scans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    scan_type character varying(30) DEFAULT 'drivers_license'::character varying,
    front_image_url text,
    back_image_url text,
    extracted_data jsonb,
    confidence_score numeric(5,2),
    is_verified boolean DEFAULT false,
    verified_by uuid,
    scan_id character varying(80),
    raw_text text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ocr_scans OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24498)
-- Name: security_shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.security_shifts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    badge_id character varying(20),
    duty_status public.duty_status DEFAULT 'off_duty'::public.duty_status,
    assigned_post character varying(50),
    shift_start time without time zone NOT NULL,
    shift_end time without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.security_shifts OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 24706)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    key character varying(50) NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 24687)
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    actor_id uuid,
    action character varying(100) NOT NULL,
    category public.log_category DEFAULT 'system'::public.log_category,
    details jsonb,
    ip_address character varying(45),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24293)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role DEFAULT 'student'::public.user_role NOT NULL,
    status public.account_status DEFAULT 'pending'::public.account_status NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100) NOT NULL,
    full_name character varying(255) GENERATED ALWAYS AS (TRIM(BOTH FROM ((((first_name)::text || ' '::text) || COALESCE(((middle_name)::text || ' '::text), ''::text)) || (last_name)::text))) STORED,
    sex public.sex_type,
    birth_date date,
    nationality character varying(50) DEFAULT 'Filipino'::character varying,
    phone_number character varying(20),
    address text,
    student_id character varying(50),
    department character varying(100),
    academic_program character varying(100),
    year_level character varying(20),
    section character varying(50),
    faculty_id character varying(50),
    "position" character varying(100),
    employment_type character varying(50),
    staff_id character varying(50),
    staff_department character varying(100),
    job_title character varying(100),
    employment_status character varying(50),
    visitor_purpose character varying(100),
    visitor_host character varying(100),
    visitor_reason text,
    visitor_valid_id character varying(100),
    visitor_date date,
    visitor_duration character varying(50),
    entry_motive character varying(100),
    drivers_license_no character varying(50),
    license_expiry_date date,
    registration_token uuid DEFAULT public.uuid_generate_v4(),
    id_photo_path text,
    orcr_photo_path text,
    qr_code_path text,
    profile_image_url text,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24348)
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    plate_number character varying(20) NOT NULL,
    type public.vehicle_type DEFAULT 'car'::public.vehicle_type NOT NULL,
    brand character varying(50),
    color character varying(30),
    other_vehicle_type character varying(50),
    anpr_flagged boolean DEFAULT false,
    anpr_flag_msg text,
    status public.vehicle_status DEFAULT 'pending'::public.vehicle_status NOT NULL,
    registration_date timestamp with time zone DEFAULT now(),
    expiry_date timestamp with time zone,
    approved_by uuid,
    approved_at timestamp with time zone,
    is_on_campus boolean DEFAULT false,
    last_seen_gate character varying(100),
    last_seen_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    orcr_photo_path text
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 24638)
-- Name: violations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.violations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entry_log_id uuid,
    vehicle_id uuid,
    type public.violation_type NOT NULL,
    description text,
    fine_amount numeric(10,2) DEFAULT 0.00,
    status character varying(20) DEFAULT 'unresolved'::character varying,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.violations OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24427)
-- Name: visitor_vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitor_vehicles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    visitor_id uuid,
    plate_number character varying(20) NOT NULL,
    type public.vehicle_type DEFAULT 'car'::public.vehicle_type,
    brand character varying(50),
    color character varying(30),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.visitor_vehicles OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24405)
-- Name: visitors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    full_name character varying(255) NOT NULL,
    phone_number character varying(20),
    purpose_of_visit text,
    host_user_id uuid,
    id_type character varying(50),
    id_number character varying(50),
    check_in_at timestamp with time zone DEFAULT now(),
    check_out_at timestamp with time zone,
    gate_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.visitors OWNER TO postgres;

--
-- TOC entry 4936 (class 2604 OID 20627)
-- Name: anpr_camera_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_camera_config ALTER COLUMN id SET DEFAULT nextval('public.anpr_camera_config_id_seq'::regclass);


--
-- TOC entry 4943 (class 2604 OID 20628)
-- Name: detected_vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detected_vehicles ALTER COLUMN id SET DEFAULT nextval('public.detected_vehicles_id_seq'::regclass);


--
-- TOC entry 5298 (class 0 OID 24617)
-- Dependencies: 237
-- Data for Name: anpr_anomaly_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.anpr_anomaly_events (id, capture_id, kind, status, notes, tags, created_at) FROM stdin;
1bcace19-4211-49db-8083-30896884da0a	8a48856d-fb1b-465b-a462-6b63b3629d80	anomaly_unregistered	open	\N	["Unregistered", "Unknown"]	2026-05-18 23:02:06.789697+08
61ac596a-69e5-46a7-8d79-4fa589d60eb9	a08be644-5307-4b5f-bc32-8f8adedbc035	anomaly_low_confidence	resolved	Manually verified by guard.	["Blurry", "Night"]	2026-05-18 21:02:06.789697+08
ca1aa0b7-7d08-47c0-b8f9-d980375ed4e4	6f141a3e-aefd-47c7-af75-480984a54137	anomaly_rapid_movement	open	\N	["Speeding", "Tailgating"]	2026-05-18 23:17:06.789697+08
6757666e-4935-4b6f-836e-ed55afeec7a0	3b0b2de3-bd53-4976-b27d-cad78bdc3671	anomaly_frequent_unregistered	escalated	\N	["Frequent", "Delivery?"]	2026-05-18 00:02:06.789697+08
467aa1bd-0103-407d-aad7-d2b566503088	3727a0fc-7d15-4809-85f7-33e7a12eb6be	breach_blacklisted	open	\N	["Blacklisted", "High Risk"]	2026-05-18 23:47:06.789697+08
\.


--
-- TOC entry 5281 (class 0 OID 20402)
-- Dependencies: 220
-- Data for Name: anpr_camera_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.anpr_camera_config (id, camera_id, camera_name, camera_type, camera_source, location, gate_id, latitude, longitude, is_active, frame_width, frame_height, fps, resolution, notes, created_at, updated_at) FROM stdin;
1	1	Main Gate Camera	usb	0	Main Gate	GATE_01	\N	\N	t	1920	1080	30	\N	\N	2026-04-12 03:35:28.181245	2026-04-12 03:35:28.181245
2	2	Side Gate Camera	rtsp	rtsp://192.168.1.101:554/stream	Side Gate	GATE_02	\N	\N	t	1920	1080	30	\N	\N	2026-04-12 03:35:28.181245	2026-04-12 03:35:28.181245
\.


--
-- TOC entry 5297 (class 0 OID 24578)
-- Dependencies: 236
-- Data for Name: anpr_plate_captures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.anpr_plate_captures (id, plate_normalized, plate_raw, confidence_score, brand, color, vehicle_type_detected, camera_id, gate_id, vehicle_id, recorded_by, alert_kind, payload, entry_log_id, created_at) FROM stdin;
8a48856d-fb1b-465b-a462-6b63b3629d80	UNR1234	UNR 1234	85.50	Toyota	Silver	car	\N	8badc210-0cd8-499f-8c8f-a499c5cec5b5	\N	\N	anomaly_unregistered	\N	\N	2026-05-18 23:02:06.789697+08
a08be644-5307-4b5f-bc32-8f8adedbc035	LOW5678	LOW 5678	45.20	Mitsubishi	Black	van	\N	e1416527-c574-416c-b356-82b135560ac1	\N	\N	anomaly_low_confidence	\N	\N	2026-05-18 21:02:06.789697+08
6f141a3e-aefd-47c7-af75-480984a54137	ITR6180	ITR 6180	98.10	Honda	Red	car	\N	8badc210-0cd8-499f-8c8f-a499c5cec5b5	006968db-3f98-4914-9190-aebc0e16b038	\N	anomaly_rapid_movement	\N	\N	2026-05-18 23:17:06.789697+08
3b0b2de3-bd53-4976-b27d-cad78bdc3671	FREQ999	FREQ 999	92.00	Nissan	White	truck	\N	8badc210-0cd8-499f-8c8f-a499c5cec5b5	\N	\N	anomaly_frequent_unregistered	\N	\N	2026-05-18 00:02:06.789697+08
3727a0fc-7d15-4809-85f7-33e7a12eb6be	XCX3876	XCX 3876	99.20	Hyundai	Black	car	\N	8badc210-0cd8-499f-8c8f-a499c5cec5b5	6058db76-7960-4bd3-a712-9f1d2bafad6b	\N	breach_blacklisted	\N	\N	2026-05-18 23:47:06.789697+08
\.


--
-- TOC entry 5288 (class 0 OID 24382)
-- Dependencies: 227
-- Data for Name: blacklist_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blacklist_records (id, vehicle_id, reason, added_by, start_date, end_date, is_active, created_at) FROM stdin;
\.


--
-- TOC entry 5293 (class 0 OID 24479)
-- Dependencies: 232
-- Data for Name: camera_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camera_settings (id, camera_id, detection_threshold, recording_mode, ai_night_vision, updated_at) FROM stdin;
\.


--
-- TOC entry 5292 (class 0 OID 24459)
-- Dependencies: 231
-- Data for Name: cameras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cameras (id, gate_id, name, "position", ip_address, stream_url, direction, is_active, is_streaming, last_plate_detected, last_plate_detected_at, offline_since, created_at, updated_at) FROM stdin;
52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	Main Gate - Entry	Front Left	192.168.1.101	\N	entry	t	f	\N	\N	\N	2026-05-19 00:02:05.468044+08	\N
87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	Main Gate - Exit	Front Right	192.168.1.102	\N	exit	t	f	\N	\N	\N	2026-05-19 00:02:05.468044+08	\N
7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	Back Gate - Entry	Rear Left	192.168.1.103	\N	entry	t	f	\N	\N	\N	2026-05-19 00:02:05.468044+08	\N
2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	Back Gate - Exit	Rear Right	192.168.1.104	\N	exit	t	f	\N	\N	\N	2026-05-19 00:02:05.468044+08	\N
\.


--
-- TOC entry 5283 (class 0 OID 20464)
-- Dependencies: 222
-- Data for Name: detected_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detected_vehicles (id, detection_id, camera_id, plate_number, plate_confidence, vehicle_type, vehicle_brand, vehicle_model, vehicle_color, detection_model, detection_confidence, ocr_model, ocr_confidence, frame_timestamp, detection_timestamp, image_path, plate_image_path, raw_ocr_text, normalized_plate_text, is_authorized, notes, created_at) FROM stdin;
\.


--
-- TOC entry 5295 (class 0 OID 24516)
-- Dependencies: 234
-- Data for Name: duty_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.duty_logs (id, shift_id, user_id, clock_in, clock_out, vehicles_logged, notes, created_at) FROM stdin;
\.


--
-- TOC entry 5296 (class 0 OID 24537)
-- Dependencies: 235
-- Data for Name: entry_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entry_logs (id, camera_id, gate_id, detected_plate_number, vehicle_id, user_id, "timestamp", direction, category, confidence_score, snapshot_image_url, authorization_status, is_violation, requires_manual_verification) FROM stdin;
56645233-8b77-4443-9ef9-51a2bffb2d44	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-18 16:23:57.548478+08	entry	entry	91.49	\N	authorized	f	f
e9d89c19-04cb-48ef-b175-77989740d7db	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 16:13:39.548478+08	exit	exit	96.15	\N	authorized	f	f
1e8f409b-6b55-4ece-9057-d6f3524e8631	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-18 22:48:38.548478+08	entry	entry	86.91	\N	authorized	f	f
e168f0e8-cedb-4a9c-90db-cd2311e000d3	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-19 00:20:04.548478+08	entry	entry	89.41	\N	authorized	f	f
7cacbb67-63c5-4672-86e6-e09bb2c35445	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 17:14:32.548478+08	entry	entry	88.55	\N	authorized	f	f
1d401c90-1b57-4eea-bc9e-73dd49cea5d9	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-18 17:13:22.548478+08	exit	exit	93.35	\N	authorized	f	f
01654b5f-945b-4801-8f3b-06ff24658218	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-18 21:12:38.548478+08	entry	entry	99.83	\N	authorized	f	f
5b662983-4650-47b3-b456-a8e03538c1c7	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-18 22:25:42.548478+08	exit	exit	98.27	\N	authorized	f	f
fd24c3d3-2e55-49c3-86e4-54f283bacf0c	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-18 14:45:29.548478+08	exit	exit	85.52	\N	authorized	f	f
eea69532-c143-4b59-bdf9-9709e7d8ff99	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-19 05:34:28.548478+08	exit	exit	99.58	\N	authorized	f	f
b9b4c534-eaae-4ecc-b211-ac878d932151	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-18 16:04:05.548478+08	entry	entry	89.06	\N	authorized	f	f
106371e6-c779-4c79-b42b-f86107ddcafa	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-18 22:34:42.548478+08	entry	entry	91.95	\N	authorized	f	f
f46971c0-f130-492b-9c97-46d77a175abb	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 17:45:55.548478+08	entry	entry	85.88	\N	authorized	f	f
bd0cca20-1305-40e8-b3d4-3abe91fcb8c4	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-18 21:48:25.548478+08	exit	exit	90.61	\N	authorized	f	f
ef0341d5-032f-4f9e-a964-b9174c26ce9c	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-19 00:49:36.548478+08	entry	entry	91.79	\N	authorized	f	f
cf3e6746-1e7d-4230-9619-e37b6836aa14	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-18 22:41:45.548478+08	entry	entry	88.93	\N	authorized	f	f
279fc3e5-aeef-421d-a7fd-d749aa48ff6b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-18 23:07:08.548478+08	exit	exit	93.50	\N	authorized	f	f
1a7b110d-4ab9-49e0-b152-3814df4341af	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-18 15:41:33.548478+08	exit	exit	88.93	\N	authorized	f	f
904a269a-0597-48b7-a771-7863b27cc4a2	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-19 00:25:14.548478+08	exit	exit	87.83	\N	authorized	f	f
6335f607-4f21-455a-96cc-8edc3e5508e7	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 22:19:00.548478+08	entry	entry	96.16	\N	authorized	f	f
c06d8c0d-beb4-4f03-8636-581787e2a09e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-18 16:39:10.548478+08	entry	entry	85.32	\N	authorized	f	f
8c1af5ee-f666-4656-87ac-81bf64a6a3f5	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-18 15:04:59.548478+08	exit	exit	92.00	\N	authorized	f	f
74984482-6670-4bae-96e2-aae103a16254	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-19 01:51:11.548478+08	exit	exit	95.57	\N	authorized	f	f
17148d43-f908-4635-927a-fbe2df1f0a78	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-18 18:16:58.548478+08	entry	entry	86.43	\N	authorized	f	f
27581774-86b2-40c3-8b4d-81ab1c740d5b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-17 21:45:01.548478+08	entry	entry	92.73	\N	authorized	f	f
0cbd9217-4de0-4e7b-8a86-eedac8ab0634	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 14:12:04.548478+08	entry	entry	97.95	\N	authorized	f	f
94fe4e3d-7f63-46bf-b97a-1eb60969ccbc	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-18 05:44:45.548478+08	entry	entry	89.04	\N	authorized	f	f
f0e07bf4-f3bc-4915-b1e0-f70a4324d348	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-17 16:16:35.548478+08	exit	exit	86.84	\N	authorized	f	f
519f98e6-1a4c-420c-b9b0-4d9623333bf1	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 19:25:50.548478+08	entry	entry	99.42	\N	authorized	f	f
39ca9f54-bc00-4129-9e1d-e4ed43778a0d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 14:01:30.548478+08	exit	exit	98.43	\N	authorized	f	f
3af58b4c-c7a7-4556-a298-16e4334f6ed7	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-16 14:23:37.548478+08	entry	entry	94.33	\N	authorized	f	f
ddd39870-67f7-4e0d-b3cb-5961deceef57	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-17 06:06:30.548478+08	exit	exit	94.55	\N	authorized	f	f
90f78d67-9b00-4f19-b304-cf004fa19aef	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-17 02:48:16.548478+08	exit	exit	92.34	\N	authorized	f	f
352810b8-b145-49f4-a483-a22882e4dca5	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-16 20:26:43.548478+08	exit	exit	95.37	\N	authorized	f	f
75fc8453-96b8-41e4-a9a4-6144ce93a95e	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-16 22:46:35.548478+08	entry	entry	96.85	\N	authorized	f	f
f2e99283-284b-45f5-8057-23053bb5f15d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 17:06:28.548478+08	entry	entry	98.38	\N	authorized	f	f
a6949cf4-39a8-4bf8-90ba-4d77925f9c44	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-16 22:48:50.548478+08	entry	entry	86.82	\N	authorized	f	f
d744fd7f-3d05-4d3c-ae9a-f40367294e6d	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-16 23:43:45.548478+08	exit	exit	96.02	\N	authorized	f	f
c551509f-8eee-4fee-bdf7-49447b357fe3	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-16 15:35:47.548478+08	entry	entry	94.43	\N	authorized	f	f
eed5b12b-080d-40bc-ad5d-00b2086ac8c4	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-16 21:49:49.548478+08	entry	entry	99.40	\N	authorized	f	f
0a0d345c-f11c-4441-825f-fb8a95206092	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-16 23:24:56.548478+08	exit	exit	90.64	\N	authorized	f	f
d7b3aab9-81dc-4e80-b370-b176e0ad1b5d	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-16 19:34:56.548478+08	entry	entry	86.14	\N	authorized	f	f
d8c9609e-9267-4552-9fa6-256be41d1cca	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-16 19:54:08.548478+08	exit	exit	95.91	\N	authorized	f	f
498c0e4a-abb9-41be-94f5-41647c82c3be	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-15 16:30:41.548478+08	entry	entry	95.10	\N	authorized	f	f
5fa3860d-16a6-4d7b-9b15-6f28b92298c0	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 00:47:29.548478+08	entry	entry	95.86	\N	authorized	f	f
278719fc-adfd-4c06-95ab-8adaf65c0421	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-15 08:21:44.548478+08	exit	exit	89.59	\N	authorized	f	f
32044996-62f7-4f44-808d-cb00928ebe38	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-16 00:25:16.548478+08	exit	exit	89.69	\N	authorized	f	f
cb978f4c-0e88-44f2-b40d-00e629f7e960	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-15 21:03:24.548478+08	entry	entry	92.24	\N	authorized	f	f
e361895b-7c9d-4278-bc6e-166bf9d410bf	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-15 18:21:36.548478+08	entry	entry	90.07	\N	authorized	f	f
c5a68783-beb8-4ffb-8283-345865ea335e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-15 19:14:14.548478+08	entry	entry	85.38	\N	authorized	f	f
4c04a622-adf3-4d53-8581-660fd88b24d7	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-15 16:11:05.548478+08	exit	exit	86.66	\N	authorized	f	f
902f95b2-a519-4889-833a-c4d72eeb2580	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 22:30:00.548478+08	exit	exit	88.54	\N	authorized	f	f
1e9ecf03-a06b-4b0f-9cf4-a0d20a197b9d	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-16 07:16:13.548478+08	exit	exit	85.23	\N	authorized	f	f
7ee0b36f-5316-4be7-917c-5ca3446f86d7	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-15 11:01:55.548478+08	entry	entry	98.15	\N	authorized	f	f
ed010480-1fad-43b4-8724-279f9769471f	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-15 22:28:37.548478+08	entry	entry	88.45	\N	authorized	f	f
1ef79097-8fd4-4273-8d45-d9f70b62d562	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-16 00:24:27.548478+08	exit	exit	91.04	\N	authorized	f	f
f118dfdc-9d19-406a-8d8c-b690217a8436	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-15 21:50:58.548478+08	entry	entry	92.28	\N	authorized	f	f
343e68ca-79eb-4cb7-b2a8-86d0bfbc33ec	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-16 01:48:03.548478+08	exit	exit	85.33	\N	authorized	f	f
48bdeb00-6ee3-4077-94a0-821287842911	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 20:23:32.548478+08	entry	entry	89.77	\N	authorized	f	f
b36ab784-f38f-44f0-bb6a-3f691b762f3d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 16:55:27.548478+08	entry	entry	89.69	\N	authorized	f	f
88bac21d-2e8b-49d6-a343-cbe78d1b8009	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-15 22:53:53.548478+08	entry	entry	96.35	\N	authorized	f	f
4fb21ab0-88c8-446d-b3f4-13b8ef55158b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-15 09:32:57.548478+08	exit	exit	85.91	\N	authorized	f	f
bf63373f-c926-4647-a93c-2ecb9025cecd	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-15 23:44:28.548478+08	exit	exit	91.44	\N	authorized	f	f
14123a37-049d-485b-a50b-ab66d243ce2f	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-16 01:18:05.548478+08	entry	entry	97.78	\N	authorized	f	f
f39619e9-1890-4798-89b1-cae7d94271d1	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-15 23:21:59.548478+08	exit	exit	92.98	\N	authorized	f	f
cbe0be75-bc03-44ce-b6f8-af127378b8e2	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 16:32:58.548478+08	entry	entry	98.50	\N	authorized	f	f
423d3e6e-551a-4bbe-ae5f-44ddcbf843ea	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 15:42:24.548478+08	exit	exit	99.77	\N	authorized	f	f
c8831457-ce67-4283-a36f-873abaff0908	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-15 17:46:20.548478+08	exit	exit	96.36	\N	authorized	f	f
da3d69da-69f5-4ca6-80c0-6276b7d4de0b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-15 15:20:46.548478+08	exit	exit	86.91	\N	authorized	f	f
2779c347-0825-4819-93fa-0f70272fa9a5	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-14 23:27:16.548478+08	entry	entry	92.38	\N	authorized	f	f
3450a453-d515-471b-992c-092dd74a29b1	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-14 22:02:42.548478+08	exit	exit	91.54	\N	authorized	f	f
155c06ab-2ea9-401a-983b-cd625b2368ce	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-15 00:27:23.548478+08	exit	exit	89.36	\N	authorized	f	f
2640d66a-d2f5-435f-975f-42c3dab474f1	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-14 23:55:47.548478+08	entry	entry	85.36	\N	authorized	f	f
ca6f61ec-3d7c-4a65-81cc-365819ec1613	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-14 23:05:12.548478+08	exit	exit	85.68	\N	authorized	f	f
14c8fb0b-4442-44d3-bb7c-e54878df3b70	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-14 16:23:07.548478+08	entry	entry	85.48	\N	authorized	f	f
cccda879-7a73-4bb6-b162-4e01e6820dad	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-15 00:47:19.548478+08	entry	entry	98.40	\N	authorized	f	f
5f8a5eb6-3327-4143-bc37-472e20822bf1	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-14 15:20:20.548478+08	exit	exit	91.54	\N	authorized	f	f
89299135-f23a-478e-837a-b5f9e1f6d868	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-15 00:25:26.548478+08	entry	entry	87.23	\N	authorized	f	f
f1870459-53a5-457e-8d7e-9e90316f13c3	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-14 08:07:18.548478+08	exit	exit	86.39	\N	authorized	f	f
f4d473cb-64f3-4b7e-b6ea-701d1457210c	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-14 14:12:15.548478+08	entry	entry	97.27	\N	authorized	f	f
b3896c75-87bb-4f82-94f2-912c4c6ce41b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-14 16:17:44.548478+08	entry	entry	92.50	\N	authorized	f	f
336be84c-59ce-40b6-8881-d1a6be264826	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-14 18:52:41.548478+08	entry	entry	97.08	\N	authorized	f	f
e245abe7-0789-4d24-95ee-c7729faa52f8	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-15 00:49:47.548478+08	entry	entry	97.12	\N	authorized	f	f
7dc9d3be-d5e5-401e-91d9-e99cee9f41c5	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-14 21:27:04.548478+08	exit	exit	96.82	\N	authorized	f	f
c056d8c3-09a8-4e72-8496-681044526765	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-14 15:46:44.548478+08	entry	entry	85.47	\N	authorized	f	f
fa36856f-bdca-4a29-a448-e12addbde48e	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-14 18:52:40.548478+08	entry	entry	99.76	\N	authorized	f	f
a7a7bd3a-1694-4fbf-8dfd-4fd69e504695	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-15 02:23:38.548478+08	exit	exit	87.85	\N	authorized	f	f
12590543-6e7f-44d9-9eca-9060749a3381	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-14 16:54:11.548478+08	exit	exit	92.25	\N	authorized	f	f
7dd9a075-0d68-4f44-a90e-da1d19cf213a	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-14 16:13:26.548478+08	exit	exit	99.83	\N	authorized	f	f
50c0a57c-e948-4294-8a26-8af54f3503b4	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-14 19:18:51.548478+08	entry	entry	97.28	\N	authorized	f	f
e24972d0-4f81-46da-8d40-4f4025406244	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-15 00:11:21.548478+08	exit	exit	93.65	\N	authorized	f	f
09d5d8a8-bb82-4ca4-afd2-5cda0cf8fce1	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-14 22:31:48.548478+08	exit	exit	87.28	\N	authorized	f	f
1a0cee5d-f730-497e-b766-2197c3914f64	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-14 16:18:51.548478+08	entry	entry	85.47	\N	authorized	f	f
a814e414-edbc-45a6-929c-114c5f7e3e07	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-14 23:32:22.548478+08	entry	entry	94.59	\N	authorized	f	f
5c536b8f-7032-4bfe-88a5-4d3cead1b018	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-14 15:47:55.548478+08	exit	exit	96.28	\N	authorized	f	f
4bfe694c-926d-4ee3-b576-b1e577eb11c3	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-14 15:47:58.548478+08	entry	entry	95.13	\N	authorized	f	f
4fd57e7f-2d76-4f9d-9faf-e54ec10a8f96	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-14 16:55:10.548478+08	exit	exit	89.59	\N	authorized	f	f
b607408b-c88b-4553-98f8-f04c53de119e	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-14 23:32:28.548478+08	entry	entry	91.62	\N	authorized	f	f
7a9d7a76-c3de-4172-a2ca-6ecfe37967db	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-15 01:41:44.548478+08	entry	entry	99.86	\N	authorized	f	f
ee60c523-d9a0-42a2-93ea-205743298142	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-14 20:58:10.548478+08	entry	entry	89.38	\N	authorized	f	f
b424a87c-7f2b-4389-b2ee-f49c9ea5659a	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-14 20:07:43.548478+08	exit	exit	92.68	\N	authorized	f	f
66ef20da-a0fd-42f9-9ddd-d2931aa89256	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 04:19:09.548478+08	exit	exit	92.89	\N	authorized	f	f
b007fac7-4cf7-482f-a0da-8101df91e8e2	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-14 18:40:18.548478+08	exit	exit	95.96	\N	authorized	f	f
d839adee-b8df-4d8e-a9a2-f177e8727dd2	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-14 23:30:48.548478+08	exit	exit	97.85	\N	authorized	f	f
28f0dd0a-55cd-46a3-a53e-77a0852a0a57	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-14 12:57:17.548478+08	exit	exit	88.88	\N	authorized	f	f
c5910329-2a40-46df-81a3-bcdf5e307133	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-14 05:23:33.548478+08	entry	entry	89.52	\N	authorized	f	f
5df4d8b0-24ea-48a8-aad1-418828bc7470	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-13 22:23:40.548478+08	entry	entry	89.64	\N	authorized	f	f
a5a94567-0b43-4179-ae7f-d1e3cbef806b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-13 22:59:23.548478+08	entry	entry	92.14	\N	authorized	f	f
35d66692-713e-49f2-83d0-9aa3c0ed23fd	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-14 07:43:41.548478+08	exit	exit	98.92	\N	authorized	f	f
ef4e6bc0-ab66-4ff9-a9de-f8abfd6e8988	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-13 09:18:13.548478+08	entry	entry	99.72	\N	authorized	f	f
9a862916-8adb-417a-b350-569d79fd643c	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-14 00:17:11.548478+08	exit	exit	93.81	\N	authorized	f	f
536d7ffa-b63a-41df-a318-0ef73b743728	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-13 18:10:50.548478+08	entry	entry	99.63	\N	authorized	f	f
b9613fa9-d262-426f-8729-0a818f20073f	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-13 23:30:40.548478+08	exit	exit	96.52	\N	authorized	f	f
514227e5-93e2-4b00-9fb6-83c4ab5c0dd5	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-13 23:49:41.548478+08	exit	exit	92.43	\N	authorized	f	f
83292124-4183-4dae-83e0-ae47b79dbf6c	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-13 21:37:44.548478+08	entry	entry	85.72	\N	authorized	f	f
f5b49bdd-aa65-43ca-85bf-551402a49261	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-13 14:15:27.548478+08	exit	exit	98.88	\N	authorized	f	f
365ae739-a780-42dc-80f9-9bb8c13900e1	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-13 17:16:47.548478+08	entry	entry	93.55	\N	authorized	f	f
21bea177-6d45-4280-82f9-a92edc19e50b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-13 21:23:25.548478+08	entry	entry	97.75	\N	authorized	f	f
2760216a-5703-47da-857b-b5f59dac70cd	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-13 21:17:55.548478+08	entry	entry	92.37	\N	authorized	f	f
230deb6b-381f-4d57-86db-c4766354c9c1	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-13 23:59:26.548478+08	exit	exit	87.52	\N	authorized	f	f
9bd8b82f-36c4-446c-9fbd-bccba8e64653	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-14 00:11:28.548478+08	exit	exit	96.67	\N	authorized	f	f
09860e32-aed0-48f5-85b4-1abb5acbe878	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-14 00:59:23.548478+08	exit	exit	93.39	\N	authorized	f	f
c8668487-88aa-4fca-9089-5f46a714b97d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-13 16:08:34.548478+08	exit	exit	91.53	\N	authorized	f	f
962e76f5-b706-4821-ab90-2433f26d75a9	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-13 22:05:57.548478+08	exit	exit	90.21	\N	authorized	f	f
5788c233-8317-492d-ad7e-98ed338bd585	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-14 00:39:03.548478+08	entry	entry	91.81	\N	authorized	f	f
a6264dd5-2505-42c3-afad-d7323f77eaf6	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-13 23:39:38.548478+08	exit	exit	97.64	\N	authorized	f	f
42b2b3dc-c7b3-446d-8424-591ed144fb85	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-13 15:35:23.548478+08	exit	exit	98.90	\N	authorized	f	f
174e6639-11b2-4ce6-9e52-e1d9fb326b5c	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-13 22:32:24.548478+08	entry	entry	86.00	\N	authorized	f	f
2b451221-ef43-4a36-8a51-f650a1912c04	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-13 17:35:32.548478+08	exit	exit	87.80	\N	authorized	f	f
fd944c71-03ad-4e42-8bff-45dc2f758091	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-13 16:05:01.548478+08	entry	entry	89.19	\N	authorized	f	f
670d01c6-6401-4422-b74d-c1aed8d0581e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-13 16:49:54.548478+08	exit	exit	87.53	\N	authorized	f	f
77e77024-747f-4c79-8abe-4eeedb5efc9b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-14 07:15:58.548478+08	entry	entry	95.60	\N	authorized	f	f
7488b0e4-08e6-4639-a05d-41ca0eb91d1a	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-13 20:43:05.548478+08	exit	exit	91.72	\N	authorized	f	f
5bc8cb2c-bf92-4205-86c7-fe5d333e2213	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-14 02:48:16.548478+08	exit	exit	98.14	\N	authorized	f	f
84d4897a-4b90-45b2-bab2-1619cf6c16dc	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-13 23:35:56.548478+08	exit	exit	87.90	\N	authorized	f	f
5058929d-9de1-4a59-9af0-8c7b3832e22f	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-14 03:25:42.548478+08	exit	exit	91.48	\N	authorized	f	f
ec5a181f-420a-48a8-b4fb-ca89c9e515ca	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-13 15:49:48.548478+08	entry	entry	94.32	\N	authorized	f	f
608837f9-afb3-4616-988b-8195484fc3e0	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-13 15:50:32.548478+08	exit	exit	94.16	\N	authorized	f	f
dc551a4c-18c6-46bc-87c0-86dca49a84f6	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-14 04:21:40.548478+08	exit	exit	96.72	\N	authorized	f	f
b16679f0-3ecb-4f9b-9aac-6d79fa6a53c6	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-13 20:45:33.548478+08	exit	exit	95.75	\N	authorized	f	f
0b9e12b6-2e3c-4d0f-928e-65e71d3f6297	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-13 20:25:01.548478+08	entry	entry	92.46	\N	authorized	f	f
a99cc606-8f7f-4fda-ab69-31b9588a985e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-13 15:09:47.548478+08	entry	entry	96.50	\N	authorized	f	f
5a0be2bd-23dd-46bc-b1b9-54b94c4a5109	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-12 23:34:09.548478+08	exit	exit	92.64	\N	authorized	f	f
40c675f7-593b-4907-bafd-bb76242697af	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-13 00:02:46.548478+08	entry	entry	87.06	\N	authorized	f	f
1d41f84a-5f7b-44f0-9fa6-cfcc4fcaf726	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-13 03:27:59.548478+08	entry	entry	93.98	\N	authorized	f	f
0cc95469-4828-4b85-9b3c-ae52d0708938	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-12 20:57:21.548478+08	exit	exit	89.24	\N	authorized	f	f
3101f09e-1f5b-4b18-b0dd-c9ff8a73fa81	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-12 14:59:25.548478+08	exit	exit	99.04	\N	authorized	f	f
4b2a8512-927c-46c6-9f2b-3280727efff8	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-12 18:46:50.548478+08	exit	exit	98.53	\N	authorized	f	f
66fb7053-035b-4107-ba46-200bbcf8dcdc	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-12 22:01:07.548478+08	entry	entry	92.58	\N	authorized	f	f
a32f181a-bcef-49f5-82d0-2046804e4e98	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-12 18:04:36.548478+08	exit	exit	99.74	\N	authorized	f	f
8b6e70ac-b097-49cb-8e87-4ddb2d9ad975	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-12 16:36:07.548478+08	exit	exit	97.53	\N	authorized	f	f
86daa1d5-26a6-477e-896d-00cf776b865b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-12 15:24:26.548478+08	exit	exit	90.89	\N	authorized	f	f
ca13b739-77fb-4ecb-99e9-cbeeeb666590	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-12 11:34:41.548478+08	exit	exit	93.20	\N	authorized	f	f
0d191bcc-9dca-42c0-a001-2f40df908d7d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-12 11:18:03.548478+08	exit	exit	85.33	\N	authorized	f	f
4f2163b3-cad2-475d-9503-d2a4d2c3d757	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-12 15:29:57.548478+08	entry	entry	87.72	\N	authorized	f	f
df5e3b57-e1f5-44c6-9e96-49a8cae9d014	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-12 22:38:35.548478+08	exit	exit	86.90	\N	authorized	f	f
bc7a1bd0-b74b-40b0-9b94-49fd87aac9fa	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-13 01:09:23.548478+08	exit	exit	90.61	\N	authorized	f	f
e7f148f8-df6e-4a13-a898-1e9b067839bc	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-12 23:22:17.548478+08	exit	exit	98.56	\N	authorized	f	f
0331cf1d-a9e4-4d0f-8eba-5b8fd0237a5e	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-12 23:54:13.548478+08	exit	exit	98.37	\N	authorized	f	f
572f99eb-2323-4719-87a0-9bd3e5893fc6	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-12 14:58:47.548478+08	entry	entry	89.87	\N	authorized	f	f
62a873ff-3da0-4db9-9330-4be87dd3b059	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-12 16:22:35.548478+08	exit	exit	92.09	\N	authorized	f	f
926f4a0f-7b30-46f8-a7c5-e9a044503ae5	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-12 19:24:02.548478+08	entry	entry	90.02	\N	authorized	f	f
7b99f740-4b44-4227-808c-c75a524bd759	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-12 19:55:43.548478+08	entry	entry	88.15	\N	authorized	f	f
90640d5d-4066-44ac-9111-4a08d5d43058	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-12 21:39:56.548478+08	exit	exit	99.48	\N	authorized	f	f
1d289466-ebc7-49d0-98ed-69592e001520	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-11 14:54:30.548478+08	exit	exit	99.41	\N	authorized	f	f
12b7c19e-576e-45be-bc84-3d97d82ea632	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-11 10:02:18.548478+08	entry	entry	97.65	\N	authorized	f	f
5ea45f2d-c61c-4ffe-9e11-0431968b5983	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-11 14:49:05.548478+08	exit	exit	95.00	\N	authorized	f	f
ee15745d-55c1-4bf9-be4d-086abe364aa3	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-11 20:51:12.548478+08	exit	exit	88.47	\N	authorized	f	f
edf25d4f-27be-4128-9b2b-6b0f6690f419	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-11 21:45:40.548478+08	entry	entry	87.38	\N	authorized	f	f
1099743f-9748-4900-ae3f-c366cd78fdfd	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-11 22:52:27.548478+08	exit	exit	97.73	\N	authorized	f	f
e8e1fb0b-78de-407d-8db7-91c57604bfa0	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-11 20:23:51.548478+08	entry	entry	88.13	\N	authorized	f	f
e7f216f5-eb6e-4e33-abdb-f79270d58db6	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-11 13:41:48.548478+08	exit	exit	93.77	\N	authorized	f	f
2c532a31-9d21-450c-9ddc-41194917d87d	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-12 05:12:53.548478+08	entry	entry	96.64	\N	authorized	f	f
9cc8a976-dd6d-4987-8342-ec0d346a2452	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-11 15:32:07.548478+08	entry	entry	96.65	\N	authorized	f	f
21aec45c-7eb9-4d7f-8595-d9d492f0ce0a	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-11 18:56:42.548478+08	exit	exit	85.17	\N	authorized	f	f
6b8f847d-6943-4256-98a2-37d86b000000	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-12 00:04:34.548478+08	exit	exit	92.75	\N	authorized	f	f
ac1bca97-0445-4dde-b49b-fd8e2921130a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-11 09:49:08.548478+08	entry	entry	99.77	\N	authorized	f	f
3db7df37-799b-4c9c-b16f-fced4537ab46	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-11 16:51:18.548478+08	entry	entry	93.04	\N	authorized	f	f
29790c54-d1c8-4b38-9e04-acc158a8245b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-11 23:27:48.548478+08	entry	entry	99.49	\N	authorized	f	f
f18cfbf6-ba13-4c02-b23c-16086b366407	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-11 22:20:35.548478+08	entry	entry	95.63	\N	authorized	f	f
5ebad4be-09e2-4f86-a54a-faa7ccf6c9a6	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-11 14:06:04.548478+08	exit	exit	85.92	\N	authorized	f	f
f00fd08e-8026-4d77-aac0-86feaad67f75	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-12 00:50:00.548478+08	entry	entry	94.55	\N	authorized	f	f
a813b724-e84a-4817-8853-4a9f808cd1f1	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-11 10:51:15.548478+08	exit	exit	95.55	\N	authorized	f	f
6c57cb38-7b2f-4dc3-8e0d-1a0d9b43f27b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-11 15:40:11.548478+08	entry	entry	92.61	\N	authorized	f	f
24ddb45f-3035-4433-afba-63f0b33bc4af	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-11 22:35:16.548478+08	entry	entry	93.15	\N	authorized	f	f
96d242a7-25de-425b-9cc2-1f01bf222c26	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-11 22:56:05.548478+08	exit	exit	91.91	\N	authorized	f	f
04b70bf7-4fc2-4bb9-b7b6-0e7932378803	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-11 17:41:06.548478+08	entry	entry	87.56	\N	authorized	f	f
7226dd95-d542-4605-9a08-a172038671a3	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-11 22:06:44.548478+08	exit	exit	85.61	\N	authorized	f	f
ea2c92e8-9c66-4c48-b7f2-799c3f970056	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-12 01:08:16.548478+08	entry	entry	95.45	\N	authorized	f	f
f8a707d4-e739-42cc-9c1d-83b48b069230	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-11 21:42:24.548478+08	entry	entry	95.83	\N	authorized	f	f
a6bcbf67-f39e-4710-947f-4f8d856bbd03	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-12 04:17:03.548478+08	entry	entry	91.71	\N	authorized	f	f
9fc6bff3-0e3c-4a58-bb2c-d4aa04f54831	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-11 20:01:14.548478+08	exit	exit	98.85	\N	authorized	f	f
f473a108-ff10-4a47-9c78-f8cd8c21614b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-11 22:00:42.548478+08	entry	entry	99.54	\N	authorized	f	f
4b73416d-5a71-42c2-ba4c-1b275e678332	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-11 14:49:21.548478+08	entry	entry	97.83	\N	authorized	f	f
71b46829-545b-45ef-b1d0-b95c0a99c699	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-11 15:30:26.548478+08	entry	entry	93.47	\N	authorized	f	f
b6d0dbd1-6013-408b-b7ba-80a61aaf5eea	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-11 15:02:37.548478+08	exit	exit	98.32	\N	authorized	f	f
39296f4d-941c-42ad-bdd4-d88ce716cfc6	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-11 15:46:59.548478+08	entry	entry	91.26	\N	authorized	f	f
35d3b1e4-6907-4c28-be16-3ccb45e9722c	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-11 15:57:22.548478+08	entry	entry	93.80	\N	authorized	f	f
ae15aded-bda2-4977-9437-449151098067	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-11 16:33:16.548478+08	entry	entry	92.12	\N	authorized	f	f
9d1ca7c4-7225-4d43-8cbe-83a104ed8a32	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-11 22:59:48.548478+08	exit	exit	90.54	\N	authorized	f	f
e8c4f8ab-ff48-4d12-87d8-b843818c02b9	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-12 00:06:44.548478+08	exit	exit	90.69	\N	authorized	f	f
740af94b-d589-4ac1-9452-cf307695ddc7	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-11 23:51:40.548478+08	exit	exit	88.06	\N	authorized	f	f
73d327cb-16ba-4089-98ad-c2b4f85858f6	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-11 22:33:47.548478+08	entry	entry	99.74	\N	authorized	f	f
5641b34e-a288-4a7c-9114-9c69518271e3	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-11 02:20:34.548478+08	entry	entry	99.41	\N	authorized	f	f
075449c2-dfef-4ce1-89ca-b2b064511bf6	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-10 21:28:58.548478+08	entry	entry	96.13	\N	authorized	f	f
a5f87f97-548f-45c5-a7c0-db6cb024e204	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-10 17:37:26.548478+08	exit	exit	98.57	\N	authorized	f	f
1f7c7f24-c181-4ceb-b7b5-890091b03553	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-10 20:50:10.548478+08	entry	entry	86.74	\N	authorized	f	f
4587e0d3-274d-47d4-a489-12b0eb257e8d	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-10 15:07:40.548478+08	entry	entry	90.96	\N	authorized	f	f
9696845e-b7db-47e3-899c-7f79296e7919	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-10 16:01:33.548478+08	entry	entry	85.96	\N	authorized	f	f
fd963fe7-b5d7-44fe-809e-45daaf6b0e5e	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-10 16:14:22.548478+08	entry	entry	89.67	\N	authorized	f	f
2e4be979-4925-4f0b-8cb3-3725e64d8359	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-10 20:43:58.548478+08	entry	entry	96.50	\N	authorized	f	f
18e89d3d-8698-4e57-90da-ef784da6722e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-11 00:10:24.548478+08	entry	entry	97.28	\N	authorized	f	f
faa0f0ab-7d31-44fc-97b2-796899973fe4	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-09 19:30:25.548478+08	exit	exit	91.21	\N	authorized	f	f
af41b25a-6173-4f44-ba88-c67e66a02df7	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-09 12:11:26.548478+08	entry	entry	86.16	\N	authorized	f	f
13fe84d1-e541-487c-b829-2fb21467251a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-10 00:48:58.548478+08	entry	entry	88.12	\N	authorized	f	f
fd0adab7-bf58-434d-b504-95f178731cc1	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-10 00:33:44.548478+08	exit	exit	98.68	\N	authorized	f	f
6f951b3c-19b2-4664-aa24-ab38df3cd568	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-09 15:32:02.548478+08	entry	entry	88.77	\N	authorized	f	f
fb9bd03e-cc71-4144-bdc3-b0bfec028473	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-09 18:36:33.548478+08	entry	entry	98.47	\N	authorized	f	f
a2f58201-5138-47ee-a005-ad325b4e9b09	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-10 04:59:30.548478+08	entry	entry	88.85	\N	authorized	f	f
f5625933-aa9c-4610-95bb-cc81c0374337	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-09 21:52:25.548478+08	exit	exit	91.81	\N	authorized	f	f
9405c5eb-d1bf-40cd-9a20-eb89eb0a03ad	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-09 16:45:22.548478+08	entry	entry	92.76	\N	authorized	f	f
aaf9d45c-7965-41c0-89f3-5452b3076da8	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-09 17:47:51.548478+08	entry	entry	88.03	\N	authorized	f	f
c58a5baf-5e7a-4b2c-8541-673e437c101e	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-09 14:53:53.548478+08	entry	entry	92.56	\N	authorized	f	f
79a131dd-9892-4190-bdc9-05515bf90a52	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-08 17:26:18.548478+08	exit	exit	89.77	\N	authorized	f	f
a8485ec3-3a3b-4ff8-aa16-9a9971a15420	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-08 21:37:23.548478+08	entry	entry	86.88	\N	authorized	f	f
0000b983-3b59-45e9-9786-615f6481af91	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-08 16:44:55.548478+08	entry	entry	89.37	\N	authorized	f	f
8d8c9169-b1bc-4651-b997-020657e11d98	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-09 00:40:13.548478+08	entry	entry	97.25	\N	authorized	f	f
3ca92eb8-430b-4708-a33b-ef843f5eb160	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-08 15:52:08.548478+08	exit	exit	90.55	\N	authorized	f	f
8a7e9cf0-65fd-408f-9da0-e82843eb68f8	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-08 14:47:40.548478+08	exit	exit	88.14	\N	authorized	f	f
5f5fc664-4ba8-4c80-be4c-ea99e6aff7c7	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-08 08:44:42.548478+08	entry	entry	94.81	\N	authorized	f	f
770dbe74-7a19-4037-9c75-08685483f1ac	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-08 13:47:00.548478+08	exit	exit	86.96	\N	authorized	f	f
6f23cc71-18ba-4137-8a68-d3e7f7c54719	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-08 15:10:12.548478+08	entry	entry	85.67	\N	authorized	f	f
4e720c15-bb7d-4af0-b090-595aca7bc584	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-08 20:12:28.548478+08	exit	exit	85.68	\N	authorized	f	f
3cc76eff-bedb-4eba-8239-e6d43357dc30	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-09 01:15:21.548478+08	entry	entry	86.50	\N	authorized	f	f
0f7a5ebb-80b3-4ccd-b859-9ce75779cdf7	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-08 17:42:10.548478+08	exit	exit	86.68	\N	authorized	f	f
dda7fbb3-8c0b-481b-b912-527aa88e071b	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-08 17:23:54.548478+08	entry	entry	91.35	\N	authorized	f	f
103706bf-8fae-4229-871a-f38d209e683b	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-08 15:19:45.548478+08	exit	exit	99.37	\N	authorized	f	f
c9fee6bd-6858-4c2a-8855-abdea3ead03d	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-08 18:21:05.548478+08	exit	exit	89.93	\N	authorized	f	f
da1bd6bc-c1c0-4669-80f7-ff0c47b8f4d2	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-09 00:00:32.548478+08	entry	entry	88.84	\N	authorized	f	f
c983836c-d606-4e50-a62a-4075a88853a2	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-09 06:16:51.548478+08	exit	exit	96.24	\N	authorized	f	f
8bae6a63-daae-449d-875c-ca8c387026b7	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-08 20:48:05.548478+08	exit	exit	94.39	\N	authorized	f	f
f2ce8db4-9193-4c41-9ef0-c561c3801999	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-08 22:08:40.548478+08	entry	entry	86.18	\N	authorized	f	f
9cf6fa9a-5576-4570-ba8a-d828aae0b2b2	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-08 23:19:16.548478+08	exit	exit	96.49	\N	authorized	f	f
39664a14-365b-4013-8ca5-c5e9a4ee7d41	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-08 21:30:36.548478+08	exit	exit	99.27	\N	authorized	f	f
459f6922-f348-40f7-a266-5958020c09a4	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-08 18:00:16.548478+08	exit	exit	86.03	\N	authorized	f	f
7e0f983d-d3f9-47d5-bba5-483095f67b6a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-09 02:32:17.548478+08	entry	entry	94.58	\N	authorized	f	f
16e7b136-1734-4c4f-80d1-7e508e969616	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-08 21:10:42.548478+08	entry	entry	95.24	\N	authorized	f	f
9b37c3b1-4f7f-4783-ae04-f89695ee6e0c	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-07 21:28:19.548478+08	exit	exit	97.43	\N	authorized	f	f
25edf01d-44f9-4064-9992-dec4d5c25c1c	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-07 22:33:54.548478+08	entry	entry	86.12	\N	authorized	f	f
9108fc80-83da-4cd8-97cf-b7ca73b3537b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-08 00:31:11.548478+08	entry	entry	88.10	\N	authorized	f	f
47e37a40-26cc-40e5-b53a-e487f513c0e3	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-07 12:25:12.548478+08	exit	exit	99.72	\N	authorized	f	f
d7a9dfdb-9199-4d73-a36f-802c36d11101	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-07 15:51:33.548478+08	entry	entry	91.39	\N	authorized	f	f
fbe15c83-0c52-4b62-8514-cdc27143eb91	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-07 21:26:49.548478+08	exit	exit	98.60	\N	authorized	f	f
ae56e9fb-9a29-49db-a000-360e5e66eab7	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-07 16:05:28.548478+08	exit	exit	89.10	\N	authorized	f	f
cde6f482-5fcc-4a13-bae3-cd20aa715606	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-07 21:42:29.548478+08	entry	entry	87.29	\N	authorized	f	f
bcec195a-9f13-4bec-b386-8b49439d37ae	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-07 16:01:15.548478+08	entry	entry	89.40	\N	authorized	f	f
02f79979-eda0-4d12-8e7e-a0893cfa7b61	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-07 23:33:01.548478+08	entry	entry	90.74	\N	authorized	f	f
8cfe91b6-41bc-413d-ae9e-ea17deb9e8b2	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-07 23:25:48.548478+08	entry	entry	90.78	\N	authorized	f	f
98531b04-8c9f-4bfe-bd4f-9b2da39249df	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-07 23:45:41.548478+08	exit	exit	99.68	\N	authorized	f	f
101ce57c-76a8-4c6f-9efd-69c24e3fea8f	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-07 16:09:21.548478+08	entry	entry	99.49	\N	authorized	f	f
5b2cbc5c-664f-4f39-9d88-e969a5efdd48	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-07 23:30:19.548478+08	entry	entry	90.91	\N	authorized	f	f
6ccebb1c-35be-4b87-80eb-20f4756c1980	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-07 23:39:21.548478+08	entry	entry	90.06	\N	authorized	f	f
e5b1f78b-372c-4fa4-94bd-5956bb93d23b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-08 01:21:59.548478+08	exit	exit	92.43	\N	authorized	f	f
8cdf0032-ef2f-4334-90b7-3e501c88b926	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-08 00:09:50.548478+08	exit	exit	87.48	\N	authorized	f	f
69423b14-5772-4b25-a555-8d705ae3640d	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-07 19:54:47.548478+08	entry	entry	86.81	\N	authorized	f	f
b3b3af84-1f74-4204-8b6f-6c327a686aaf	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-07 20:53:14.548478+08	exit	exit	88.32	\N	authorized	f	f
89bfacb2-d3f5-44c7-99d1-8e60d908b17e	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-07 15:24:53.548478+08	exit	exit	90.21	\N	authorized	f	f
9db87f96-8c0a-4cff-b773-a2189f7cec2b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-07 16:09:30.548478+08	exit	exit	97.51	\N	authorized	f	f
177f690c-a0a8-4aba-8c62-6ae50e1010af	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-08 01:40:35.548478+08	exit	exit	95.94	\N	authorized	f	f
5edd83e3-de4b-41a3-8d23-d06bae13c89f	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-07 22:00:48.548478+08	exit	exit	89.09	\N	authorized	f	f
c7ee2e08-97b0-43eb-9874-ba6a1f5ce213	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-07 14:12:08.548478+08	entry	entry	94.69	\N	authorized	f	f
5277df9c-bbf8-4a6b-b0c5-99afcb042809	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-07 18:29:10.548478+08	exit	exit	88.73	\N	authorized	f	f
df06abd7-9729-4743-a123-2114a3e27e50	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-07 14:20:09.548478+08	exit	exit	89.67	\N	authorized	f	f
69da88f5-4967-452a-a57b-7bd7a4dbd420	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-07 17:21:26.548478+08	exit	exit	92.36	\N	authorized	f	f
07fa2f13-f1fc-4578-a630-1e48895237b1	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-07 15:20:06.548478+08	exit	exit	91.15	\N	authorized	f	f
5f17507a-2090-4670-9b23-297c499fd5c2	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-07 19:02:24.548478+08	entry	entry	87.51	\N	authorized	f	f
37c81d02-3571-4780-873a-5f0181eade01	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-07 16:57:33.548478+08	entry	entry	87.60	\N	authorized	f	f
d4d793eb-a972-4f35-811a-8a5a76565b59	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-07 19:58:13.548478+08	exit	exit	90.88	\N	authorized	f	f
3ad01f4a-01d1-49a4-8f62-2afc1f45cb02	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-07 15:58:00.548478+08	exit	exit	95.53	\N	authorized	f	f
2776a2a7-e7a3-48ce-9961-1eecfcc5fb80	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-07 14:13:22.548478+08	entry	entry	90.37	\N	authorized	f	f
abd6c413-d45c-4151-8d11-7cb3e06d8a22	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-07 18:41:05.548478+08	exit	exit	99.17	\N	authorized	f	f
04d07423-6cd4-4be1-b71d-25222007adf3	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-06 23:59:50.548478+08	entry	entry	88.86	\N	authorized	f	f
22a5d470-20bc-4c3e-8fca-e32f0b383bbc	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-06 10:03:25.548478+08	exit	exit	88.59	\N	authorized	f	f
bfca096e-eb95-4b83-b927-c57fd9054116	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-06 20:32:48.548478+08	exit	exit	96.36	\N	authorized	f	f
89af6dc6-b6aa-4bc6-a982-022d1211d543	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-07 00:42:27.548478+08	exit	exit	91.30	\N	authorized	f	f
7fa11878-9e1d-4271-a584-501ad8ecf995	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-06 09:12:09.548478+08	exit	exit	88.49	\N	authorized	f	f
87634c25-711f-4f01-91dd-b70a64d6b71b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-06 17:55:22.548478+08	entry	entry	98.29	\N	authorized	f	f
8c261f72-27bd-4dd0-a205-fa6d3e4da443	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-07 01:46:45.548478+08	entry	entry	87.37	\N	authorized	f	f
54c740a1-d642-447e-a14b-89ceac0510b5	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-06 15:43:26.548478+08	exit	exit	85.44	\N	authorized	f	f
3ce5653b-add4-4ae4-aa1f-7bc09e396887	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-06 22:28:43.548478+08	exit	exit	88.64	\N	authorized	f	f
8aca2b32-1a87-4d78-9bc7-c3f8a68d2302	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-06 15:27:20.548478+08	entry	entry	85.28	\N	authorized	f	f
8fc0e102-cde2-409f-b193-b64b16a1df81	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-06 22:58:54.548478+08	entry	entry	92.73	\N	authorized	f	f
cc026eea-f3fc-4463-bbc5-3f22d62fa2b0	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-06 16:51:34.548478+08	exit	exit	99.45	\N	authorized	f	f
aeccd7b3-8c64-4604-a0b5-64e129917086	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-07 00:45:01.548478+08	exit	exit	93.33	\N	authorized	f	f
7f960238-5593-4889-838e-674936e64aec	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-06 23:29:49.548478+08	entry	entry	91.92	\N	authorized	f	f
a13d2607-3aee-4d22-bb3f-161e6cf7a21d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-06 15:19:23.548478+08	exit	exit	90.41	\N	authorized	f	f
6933b0f4-f565-4009-864c-c7766f9b46f1	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-06 22:17:17.548478+08	entry	entry	96.43	\N	authorized	f	f
670ab7bd-8322-4991-af31-16ec7d3d0871	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-07 00:32:32.548478+08	exit	exit	86.22	\N	authorized	f	f
5becc18d-1f69-45a6-93f4-342099d73935	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-06 17:59:39.548478+08	exit	exit	92.19	\N	authorized	f	f
28742e82-9209-48b4-a8d7-c702d0a4a1e0	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-06 14:07:04.548478+08	exit	exit	92.79	\N	authorized	f	f
d0970652-6365-458a-836d-91c3ea76783b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-06 16:44:44.548478+08	exit	exit	87.53	\N	authorized	f	f
6d8305f2-b839-4d32-9b79-5625916ef3ba	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-06 22:15:03.548478+08	exit	exit	91.30	\N	authorized	f	f
65a2a63a-0230-43a9-9827-49683f9a72dd	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-06 16:12:00.548478+08	entry	entry	94.43	\N	authorized	f	f
458a383e-c44e-4010-870e-42fecf506956	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-05 23:52:56.548478+08	entry	entry	86.99	\N	authorized	f	f
5feb8525-1b01-482a-84f1-b72da26b048a	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-05 22:37:46.548478+08	exit	exit	95.87	\N	authorized	f	f
38927902-1eb2-417e-8a76-d05b93c12fe7	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-05 23:07:29.548478+08	entry	entry	99.63	\N	authorized	f	f
a29cc68c-b449-4e05-bc56-0eccae3714b2	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-05 14:41:24.548478+08	entry	entry	88.91	\N	authorized	f	f
ab4b0919-ff1b-47b3-8d8d-44ff2b7ed45d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-05 15:30:50.548478+08	entry	entry	96.24	\N	authorized	f	f
1b27c1dd-47a0-48ca-ab20-eb9edcf40403	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-05 14:06:28.548478+08	entry	entry	97.79	\N	authorized	f	f
21a7ca60-84d3-449b-8100-87ab81cbc4bc	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-05 15:45:10.548478+08	exit	exit	89.63	\N	authorized	f	f
74b2d4e1-1fba-40c3-bd9a-c498cfcb3f8c	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-05 16:44:09.548478+08	exit	exit	87.36	\N	authorized	f	f
f153952a-8bda-4b5d-a7a4-fcdd593eeaa9	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-05 15:37:42.548478+08	exit	exit	98.14	\N	authorized	f	f
505dd537-9a4e-4f68-b045-59ace39acb99	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-05 15:06:55.548478+08	exit	exit	96.03	\N	authorized	f	f
96e3a527-120d-4c6e-9c86-b8d3cafd5346	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-05 15:14:17.548478+08	exit	exit	96.58	\N	authorized	f	f
a5466756-4620-414c-8c26-2f6573c63522	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-05 15:51:52.548478+08	exit	exit	90.85	\N	authorized	f	f
eef3ee59-7cea-4d8f-8832-b95e26e6da81	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-05 09:59:19.548478+08	exit	exit	85.31	\N	authorized	f	f
0788f03f-df5c-4993-b988-b2f71aa89ae4	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-05 09:21:07.548478+08	entry	entry	91.39	\N	authorized	f	f
ccc25c0f-d1ed-457e-914e-676c3185027b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-06 06:41:23.548478+08	entry	entry	87.75	\N	authorized	f	f
7a72c0b1-a314-46c1-b685-9c98345b99a6	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-05 14:38:21.548478+08	exit	exit	86.70	\N	authorized	f	f
a20e396b-3884-4827-b44a-3641b6147c0c	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-06 05:12:53.548478+08	exit	exit	98.85	\N	authorized	f	f
8d56ba55-58b3-4341-b9d2-0e93c100a895	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-05 20:06:03.548478+08	exit	exit	97.20	\N	authorized	f	f
80725791-8ff1-4ad3-b8fb-030425749761	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-05 19:20:40.548478+08	entry	entry	90.40	\N	authorized	f	f
520a30e0-8ed4-4236-925d-22e844ba0d7b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-05 21:00:01.548478+08	exit	exit	93.96	\N	authorized	f	f
813f62b4-53b7-4c0d-b385-284841a9e0fe	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-05 16:23:36.548478+08	entry	entry	92.89	\N	authorized	f	f
0b69cd81-a081-49ad-bf1b-0be5c7c8ac0f	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-05 18:45:14.548478+08	exit	exit	88.12	\N	authorized	f	f
012cbbb8-02c7-48b8-a995-4e8443205f2f	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-05 16:22:09.548478+08	entry	entry	99.83	\N	authorized	f	f
719c6836-2a9e-4c57-bab7-913111ce6531	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-06 00:53:30.548478+08	exit	exit	99.35	\N	authorized	f	f
f8ec807f-cf3f-4527-b4bb-46d96329a213	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-05 21:34:36.548478+08	exit	exit	97.35	\N	authorized	f	f
9bae4944-11e6-4165-b037-4fa2ce7c4c58	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-05 16:52:20.548478+08	exit	exit	91.14	\N	authorized	f	f
d09f69ef-ea56-466f-8e50-99b186ad9d5e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-05 16:31:16.548478+08	entry	entry	88.12	\N	authorized	f	f
b3c4882f-bbf4-4706-837a-65e57dc107e3	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-05 14:59:31.548478+08	exit	exit	90.72	\N	authorized	f	f
b903d993-b800-4ad7-862b-3b9cefc470c7	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-06 00:32:09.548478+08	entry	entry	90.26	\N	authorized	f	f
5e3b0f85-f570-4cd9-8016-6c4078561c57	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-06 07:27:26.548478+08	entry	entry	95.36	\N	authorized	f	f
bd3f0186-5fe2-4017-bb6e-e012c6eef618	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-05 15:33:21.548478+08	exit	exit	90.45	\N	authorized	f	f
2e9ef859-c11a-4457-a663-4da0ad831dc5	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-05 04:11:19.548478+08	exit	exit	95.52	\N	authorized	f	f
27db94f3-5aa9-44da-9709-9ec4a8276190	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-04 15:47:36.548478+08	exit	exit	97.34	\N	authorized	f	f
0be2a263-4947-4c3e-923f-f11bf62a9ff4	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-04 16:34:32.548478+08	entry	entry	99.40	\N	authorized	f	f
83a31dd5-0df7-46ce-9805-0c89b0aa75fe	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-04 23:53:10.548478+08	exit	exit	96.28	\N	authorized	f	f
22c8d7ad-f571-4a10-bf8f-3dbf0a84421b	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-04 15:49:22.548478+08	exit	exit	93.37	\N	authorized	f	f
a3236617-8377-474c-afd1-75ad90f44818	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-04 16:47:09.548478+08	entry	entry	89.55	\N	authorized	f	f
3e2665d5-daec-4830-9ff1-f319c62ed869	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-04 20:49:10.548478+08	exit	exit	99.17	\N	authorized	f	f
5b1a25a3-07c0-4dc2-9612-92856a24e8e9	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-04 09:30:45.548478+08	entry	entry	91.17	\N	authorized	f	f
2d2580a2-49ae-474f-8247-665875f59df5	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-04 22:55:02.548478+08	entry	entry	90.31	\N	authorized	f	f
becc37b6-7292-44f9-a772-b4e1774573f6	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-04 09:41:06.548478+08	entry	entry	88.57	\N	authorized	f	f
706375eb-8750-4683-9ec5-e83307dca8bc	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-04 14:20:53.548478+08	entry	entry	96.35	\N	authorized	f	f
cd7bfffb-764d-42ee-bd49-b188bb6603d1	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-04 23:45:36.548478+08	entry	entry	92.18	\N	authorized	f	f
0dde643e-3b52-4914-8614-6ed92e139989	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-04 23:52:40.548478+08	exit	exit	91.59	\N	authorized	f	f
f4c4cd16-6807-4594-86de-59e47505eea7	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-04 23:39:34.548478+08	exit	exit	88.41	\N	authorized	f	f
e70629cf-7cb6-4c98-9c73-e048deda1c7e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-05 05:40:14.548478+08	exit	exit	88.45	\N	authorized	f	f
73340937-6d9c-4c17-ad5c-e13f3e21abc5	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-04 15:02:41.548478+08	exit	exit	87.62	\N	authorized	f	f
09a5c9c1-f0cb-425d-852f-bb000033559a	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-04 14:16:16.548478+08	entry	entry	97.82	\N	authorized	f	f
c17a7c8d-c77a-403f-9046-3aadb41532aa	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-04 20:30:22.548478+08	exit	exit	88.73	\N	authorized	f	f
a0a92a6c-2c7a-405e-99a9-84ed93ca3cb3	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-04 15:03:37.548478+08	entry	entry	86.22	\N	authorized	f	f
bddfb98c-00a0-4d5d-b568-02b45ba7a9ec	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-04 17:07:54.548478+08	exit	exit	99.06	\N	authorized	f	f
6897ab1e-6653-4879-a7e4-c9e2ad2f484d	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-05 00:03:33.548478+08	exit	exit	98.55	\N	authorized	f	f
dcb29bc4-62f8-43ae-865b-584aa43bde0b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-04 16:48:05.548478+08	entry	entry	93.03	\N	authorized	f	f
aefd4352-1d93-4698-83a5-675d76c5802b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-04 14:58:44.548478+08	exit	exit	89.94	\N	authorized	f	f
a096fa43-8b02-4129-b906-203a587e88be	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-05 00:38:58.548478+08	entry	entry	98.69	\N	authorized	f	f
1ee47dbd-ecca-4ec9-b521-6f1c0d374e9e	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-04 22:15:35.548478+08	entry	entry	90.82	\N	authorized	f	f
81b6a1cb-c56a-4446-a9b6-8cb7765b4ce0	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-04 14:09:38.548478+08	entry	entry	89.56	\N	authorized	f	f
12a25a88-19f9-468d-bcac-ed29bf31aa40	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-03 15:54:45.548478+08	exit	exit	85.13	\N	authorized	f	f
d25526c4-5946-4ee7-87e8-8661de727fcb	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-03 22:22:25.548478+08	exit	exit	96.10	\N	authorized	f	f
a7977cb6-202d-4081-bdee-729d0746053d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-03 19:56:12.548478+08	entry	entry	97.05	\N	authorized	f	f
d5895b36-c84a-49c3-aec1-d9d6f9cb2d97	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-03 15:20:12.548478+08	entry	entry	91.43	\N	authorized	f	f
0570c8ac-6e44-4330-bf8d-14949565f00a	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-03 10:50:02.548478+08	entry	entry	99.58	\N	authorized	f	f
6cbb5abc-3ea9-4f59-889c-860a328dc91a	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-04 01:58:55.548478+08	entry	entry	90.22	\N	authorized	f	f
ed320d04-20e7-4f52-a207-7bd7916b1a79	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-03 15:16:12.548478+08	entry	entry	90.87	\N	authorized	f	f
8926d08f-2165-4c6b-bed6-258ce207fa87	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-03 17:49:34.548478+08	exit	exit	87.08	\N	authorized	f	f
b672b8a2-d7c6-47fb-8893-f84c01c1be9a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-04 00:37:22.548478+08	entry	entry	95.25	\N	authorized	f	f
7eafa018-6ff8-48c9-bc60-0d41500aa551	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-03 23:40:22.548478+08	entry	entry	85.04	\N	authorized	f	f
ba7737e2-9bc4-48fd-8475-6ed9d55bc042	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-05-03 23:50:27.548478+08	exit	exit	92.37	\N	authorized	f	f
403ea045-0c21-4fc8-984a-c5085a4ae4a7	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-03 12:22:37.548478+08	exit	exit	92.67	\N	authorized	f	f
8f11cecf-6298-4d6b-a9d6-6078e690a1dd	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-02 15:49:56.548478+08	exit	exit	90.10	\N	authorized	f	f
9b3be613-7ef6-48bf-8551-25f90282ce6b	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-02 12:35:42.548478+08	entry	entry	90.57	\N	authorized	f	f
dd40a79d-2ab5-4abe-8d06-68934ee151ab	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-02 17:31:05.548478+08	entry	entry	99.15	\N	authorized	f	f
c0b2fbd9-0a9c-49a6-8719-c70cdeff2f9b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-02 15:39:49.548478+08	exit	exit	91.44	\N	authorized	f	f
4f6b4bce-e952-491c-b670-47b68b441b9a	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-03 02:41:18.548478+08	exit	exit	92.58	\N	authorized	f	f
7e9851a7-ed15-4296-ab1b-5e486cd619f0	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-02 15:34:58.548478+08	exit	exit	97.37	\N	authorized	f	f
af0aec41-feb5-47b9-a339-7bcc9a0a90ee	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-02 23:03:13.548478+08	entry	entry	92.03	\N	authorized	f	f
d62b8812-441b-49c4-930d-de30f891de32	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-03 01:27:40.548478+08	entry	entry	93.40	\N	authorized	f	f
70959853-9ec8-4a11-8fdb-be467247d77b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-02 23:33:27.548478+08	entry	entry	85.43	\N	authorized	f	f
ab4a1e08-3e98-4b92-afe5-959e36746bf9	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-02 16:33:07.548478+08	exit	exit	98.72	\N	authorized	f	f
69010b05-1217-4db4-9bc3-ab7ee3ed34a9	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-02 17:33:36.548478+08	exit	exit	90.76	\N	authorized	f	f
c61e2a18-4b5e-4165-992c-57272e98e9f3	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-02 22:44:43.548478+08	entry	entry	97.49	\N	authorized	f	f
9574e8d8-05e4-4605-a5db-cb003b550c28	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-01 21:17:05.548478+08	entry	entry	96.59	\N	authorized	f	f
ea16dc58-225b-440d-a540-0ee37fda5c75	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-01 23:36:40.548478+08	entry	entry	94.28	\N	authorized	f	f
ab369ad0-b04c-4cbd-9429-ea2e5d10f6c2	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-01 21:56:08.548478+08	entry	entry	85.60	\N	authorized	f	f
6e0df1b7-bfa5-4548-9305-56071a4a61a6	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-01 17:10:58.548478+08	entry	entry	89.34	\N	authorized	f	f
de78918e-d553-447a-a9f2-7983c55b5d0b	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-01 19:42:25.548478+08	exit	exit	86.73	\N	authorized	f	f
09cb9345-77c5-417a-b311-b4b71b58d793	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-01 20:08:26.548478+08	exit	exit	97.05	\N	authorized	f	f
712a992d-680e-46d9-860f-05e478cdc002	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-01 13:35:13.548478+08	entry	entry	92.04	\N	authorized	f	f
23d30aad-05be-48b5-9bbd-de4beea0363f	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-01 15:16:36.548478+08	exit	exit	87.83	\N	authorized	f	f
0bf09811-efc9-4635-9d82-5c0cab7f6757	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-05-01 22:55:14.548478+08	exit	exit	94.02	\N	authorized	f	f
f248016e-0608-4ac1-8f1b-e57ab3443fc1	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-05-01 23:35:10.548478+08	exit	exit	99.15	\N	authorized	f	f
a6ff2c3e-ee7a-4820-be8b-336b3b47fe16	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-01 23:21:20.548478+08	entry	entry	90.81	\N	authorized	f	f
b102fd45-5898-4feb-ab99-9470c5be167e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-01 22:34:19.548478+08	entry	entry	85.57	\N	authorized	f	f
6b3e6c47-4e70-4c43-aac4-940de0581506	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-01 15:47:58.548478+08	exit	exit	95.50	\N	authorized	f	f
78abdabc-8b12-471c-a0ff-86c37673589a	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-05-01 15:12:33.548478+08	exit	exit	94.28	\N	authorized	f	f
ebbc54a0-eac2-487f-aabb-be886aa5fb12	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-01 23:27:11.548478+08	exit	exit	98.33	\N	authorized	f	f
874af1a6-516a-4adf-ac21-d5475437353a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-01 23:20:50.548478+08	entry	entry	87.39	\N	authorized	f	f
0179f641-4d89-4dc7-ac3a-e291f05c4dbf	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-05-01 11:43:22.548478+08	entry	entry	95.81	\N	authorized	f	f
e6d06679-3739-4004-9dab-3ddfdbac40cb	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-01 22:36:51.548478+08	entry	entry	96.92	\N	authorized	f	f
8d0dc422-be0b-4613-b737-a793afcbbf21	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-01 16:13:22.548478+08	entry	entry	98.26	\N	authorized	f	f
c53a51a1-c68d-4f10-8512-c782af59b826	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-01 17:50:30.548478+08	entry	entry	94.79	\N	authorized	f	f
471b4064-4562-4038-ad16-a5bad491eb87	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-02 00:53:12.548478+08	entry	entry	99.20	\N	authorized	f	f
7c315fa7-ffc0-4b1c-9f78-f250c72d143a	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-02 02:57:50.548478+08	exit	exit	97.89	\N	authorized	f	f
b7f04087-f79c-4e4e-8c73-0ded5a084e3a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-05-02 02:04:16.548478+08	entry	entry	97.87	\N	authorized	f	f
35b7c290-cc47-474b-8077-1f5116f130cc	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-01 12:40:16.548478+08	entry	entry	96.31	\N	authorized	f	f
b42e21be-8e75-46e6-9f20-3679816b51f6	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-05-01 14:40:44.548478+08	entry	entry	93.35	\N	authorized	f	f
aa2d2962-1e0b-4022-8af0-eb84f70a5e4b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-01 09:17:06.548478+08	entry	entry	90.46	\N	authorized	f	f
f242f31b-53ff-4742-96fe-e2e4ea6e3cfe	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-01 19:45:45.548478+08	exit	exit	88.97	\N	authorized	f	f
7460851d-be2c-42bb-9251-c6d1b5609df4	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-01 09:06:13.548478+08	entry	entry	90.23	\N	authorized	f	f
8599513a-a6b5-4d16-ac12-071e59344b12	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-01 16:17:50.548478+08	entry	entry	95.33	\N	authorized	f	f
0520eaa5-b687-45a1-a97c-97f095c67e33	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-02 06:19:12.548478+08	exit	exit	94.39	\N	authorized	f	f
fb8361d3-f878-43fc-a140-25c16598f3c9	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-01 22:09:31.548478+08	entry	entry	89.71	\N	authorized	f	f
4b5c6502-6cac-4dc3-8643-aaefb0b234dd	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-05-01 20:09:31.548478+08	exit	exit	89.92	\N	authorized	f	f
2f6a2b36-12ba-4ce0-8bef-781f0129ea94	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-01 16:25:17.548478+08	entry	entry	94.63	\N	authorized	f	f
e3282788-fad9-438e-ae6c-f4bb25d100f0	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-01 18:15:41.548478+08	entry	entry	91.16	\N	authorized	f	f
b9d3f15c-551b-4466-8f27-d593ed24ad2e	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-02 07:25:40.548478+08	entry	entry	96.47	\N	authorized	f	f
9be09cda-3421-4bdd-83e1-f42e21cfa45c	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-05-01 17:12:30.548478+08	exit	exit	96.17	\N	authorized	f	f
2b41d414-559a-4aa6-bc6a-bf4cb4aff719	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-05-01 17:28:27.548478+08	exit	exit	95.92	\N	authorized	f	f
eb71d553-11e1-490e-a793-9515c995677c	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-05-01 16:58:43.548478+08	exit	exit	91.46	\N	authorized	f	f
56e3c018-f131-4f10-818c-034641d72ba9	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-04-30 23:57:24.548478+08	entry	entry	93.52	\N	authorized	f	f
b11dab8b-beeb-42f0-9f8b-ac6786915017	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-30 15:56:46.548478+08	entry	entry	91.50	\N	authorized	f	f
ef7c580a-e0df-4a4b-894e-c79351b4ea29	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-30 16:28:15.548478+08	entry	entry	96.56	\N	authorized	f	f
1fd16327-64d6-4180-a4bd-c52fd1f7cb12	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-30 23:17:39.548478+08	exit	exit	92.91	\N	authorized	f	f
05219d4e-6d8f-4594-8b70-260f26ee1446	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-05-01 00:12:56.548478+08	entry	entry	91.44	\N	authorized	f	f
fc7e3b3c-908c-4538-974a-88a0364595fe	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-05-01 04:23:06.548478+08	exit	exit	97.69	\N	authorized	f	f
5d72cd0d-aa5c-4c0a-93ab-88d715d63e6f	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-30 16:11:27.548478+08	exit	exit	92.40	\N	authorized	f	f
1bb17a9e-3bf0-4651-83f9-d9a59fad281c	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-01 00:20:48.548478+08	entry	entry	98.85	\N	authorized	f	f
9fcc3a43-23ec-49bf-9fec-c5a04b162f7a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-30 16:46:21.548478+08	entry	entry	87.39	\N	authorized	f	f
3937bcf5-935c-4082-8029-b7058f76ed57	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-05-01 05:09:17.548478+08	entry	entry	92.04	\N	authorized	f	f
ad119318-ce6f-4053-ae14-bbc263242e1a	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-05-01 03:38:29.548478+08	entry	entry	99.64	\N	authorized	f	f
0e2273c5-c542-4bda-99ed-3d5d19fbd98b	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-30 14:55:37.548478+08	exit	exit	94.82	\N	authorized	f	f
410b41ba-5254-48a5-9660-2675f0e8b121	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-30 16:19:32.548478+08	exit	exit	96.30	\N	authorized	f	f
f640507d-e378-4649-91b7-6433c638c1c5	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-30 22:42:12.548478+08	entry	entry	98.81	\N	authorized	f	f
b099c985-0d87-4c27-894f-f108d77935a3	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-30 22:13:36.548478+08	exit	exit	99.40	\N	authorized	f	f
732caa9c-f4ac-4d38-8596-632c1487c3cc	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-30 16:47:30.548478+08	exit	exit	88.98	\N	authorized	f	f
7869b6c4-6aaa-46d0-8075-307a132b957a	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-30 17:23:58.548478+08	exit	exit	88.43	\N	authorized	f	f
4fb83aa0-affa-4b2a-965e-dc7be575d72a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-04-30 21:13:37.548478+08	entry	entry	97.21	\N	authorized	f	f
40b38bb0-3e64-4c9b-9832-80ac5cc64fcb	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-30 14:22:38.548478+08	exit	exit	94.01	\N	authorized	f	f
d884c3d2-c831-460a-8446-b464d39a2335	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-30 16:36:52.548478+08	exit	exit	94.46	\N	authorized	f	f
99e1637c-0b6c-40df-aff9-656c707a43c2	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-30 19:59:01.548478+08	entry	entry	92.68	\N	authorized	f	f
fae5c13a-d554-48f4-9a6c-c605804781a5	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-30 22:12:22.548478+08	entry	entry	96.94	\N	authorized	f	f
cf34ed69-8c76-470b-acc2-162cb05665cd	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-04-30 15:39:12.548478+08	entry	entry	88.24	\N	authorized	f	f
bb21197e-a3f2-451e-a252-bea584ef1255	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-30 12:26:08.548478+08	exit	exit	99.62	\N	authorized	f	f
0f6a80f8-79ef-4139-8273-25e489fb91d4	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-30 15:15:24.548478+08	entry	entry	87.68	\N	authorized	f	f
43f9e138-ab0f-4e7b-a13d-1359dd3cd01c	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-30 14:27:22.548478+08	entry	entry	90.85	\N	authorized	f	f
d2880cb9-3d21-4ed7-a265-4468aa6a7615	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-04-29 22:43:14.548478+08	entry	entry	86.91	\N	authorized	f	f
0f3fd0be-b906-4c73-a5ae-f3ac60ee76c0	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-29 14:56:26.548478+08	entry	entry	89.60	\N	authorized	f	f
c5831e88-2a0c-4404-8a41-c3da715511d0	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-29 19:56:11.548478+08	entry	entry	94.17	\N	authorized	f	f
748c709c-32e2-4993-871d-5097f264a957	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-29 22:51:48.548478+08	exit	exit	99.72	\N	authorized	f	f
25543887-a7cd-41ba-8473-ac2e96741e05	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-29 09:35:57.548478+08	entry	entry	87.03	\N	authorized	f	f
7e2ddc60-759c-4576-bcf2-544cd6672ebc	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-29 16:16:05.548478+08	entry	entry	87.53	\N	authorized	f	f
b8150bdb-9898-4a35-a52d-0a959f0cc759	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-29 16:31:48.548478+08	exit	exit	97.62	\N	authorized	f	f
20d72317-0904-4e36-82d9-ab7f4ef2d3f8	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-29 14:29:28.548478+08	entry	entry	85.15	\N	authorized	f	f
ca4f9376-c18a-41a3-8929-d180e6fc0fa6	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-29 16:17:39.548478+08	entry	entry	86.84	\N	authorized	f	f
e3aee6cb-f961-4674-aa63-8d5360a63474	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-29 17:33:12.548478+08	exit	exit	90.77	\N	authorized	f	f
0ec55660-521e-4f87-99e0-14beb1b81350	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-30 02:49:43.548478+08	entry	entry	87.31	\N	authorized	f	f
eb397738-6af1-41b5-afae-d8636ab7c04d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-30 02:09:30.548478+08	entry	entry	91.79	\N	authorized	f	f
0452e1f7-af82-4c88-8c78-60b76f8e6af5	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-29 17:18:03.548478+08	entry	entry	89.14	\N	authorized	f	f
d1c6e532-0bff-4e82-82c5-26aaccc52dd8	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-29 21:19:14.548478+08	entry	entry	87.29	\N	authorized	f	f
b1f26024-f423-4e1c-b108-a77e49a8954c	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-29 12:26:46.548478+08	exit	exit	85.14	\N	authorized	f	f
f13c8742-d856-4347-b034-cb19b6bb1224	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-29 20:46:07.548478+08	entry	entry	93.54	\N	authorized	f	f
4342f1d8-25e9-4f33-9c9c-f41fde85ead7	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-29 23:13:28.548478+08	exit	exit	86.87	\N	authorized	f	f
5aa964d3-c9c2-4370-8574-057e71ed2623	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-29 16:46:01.548478+08	exit	exit	85.33	\N	authorized	f	f
8d3cce80-bca6-47b0-a04b-6ff643f2b6b4	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-29 21:12:04.548478+08	exit	exit	88.46	\N	authorized	f	f
ca55d6b1-22d8-4828-9965-d55b0cf0b965	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-29 23:11:18.548478+08	entry	entry	94.43	\N	authorized	f	f
86af6062-30ed-474e-8280-0e471f6e425a	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-29 19:08:39.548478+08	exit	exit	88.27	\N	authorized	f	f
d276cd11-54a4-4a41-9b78-8ce873c50cce	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-04-29 23:22:46.548478+08	exit	exit	90.49	\N	authorized	f	f
1b67d9e5-f1ba-4a24-8517-3c177682a9dd	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-29 19:10:00.548478+08	entry	entry	95.47	\N	authorized	f	f
2f932e6d-82aa-40a7-bc1b-645ef40ad0f6	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-30 00:36:22.548478+08	entry	entry	93.04	\N	authorized	f	f
dcbffada-a686-40b2-a65f-5871582935a9	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-29 15:58:07.548478+08	exit	exit	93.63	\N	authorized	f	f
503471e6-c9d1-4b69-b0cb-3efe5a3400db	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-29 15:34:35.548478+08	exit	exit	99.30	\N	authorized	f	f
9458b197-f534-4c29-994e-0a1b9d225967	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-29 14:32:21.548478+08	exit	exit	95.59	\N	authorized	f	f
5716d42b-2445-4279-9449-9d317209d479	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-29 17:56:37.548478+08	exit	exit	91.71	\N	authorized	f	f
85829795-cf20-4b03-a89b-5f58e641b3b4	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-30 03:49:58.548478+08	exit	exit	94.79	\N	authorized	f	f
950414f8-41cf-4825-8da3-b74c77c86adf	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-04-29 18:50:56.548478+08	entry	entry	95.67	\N	authorized	f	f
59eb75ea-5232-484a-a2bc-ac71d1ca6024	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-29 17:01:20.548478+08	entry	entry	95.68	\N	authorized	f	f
d7b48225-c2c6-4b15-9e87-da95348f9da3	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-30 01:49:04.548478+08	exit	exit	99.45	\N	authorized	f	f
64abb81e-6ab3-4db6-978d-750227169e33	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-29 14:54:07.548478+08	exit	exit	85.55	\N	authorized	f	f
c1162a2c-de29-47f8-bc7d-bcc9f179a003	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-29 18:25:56.548478+08	exit	exit	91.82	\N	authorized	f	f
a74f4f1a-80f8-4b54-b25f-2f37141155fe	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-29 23:22:56.548478+08	exit	exit	88.61	\N	authorized	f	f
775b1dab-6a54-400e-a5e4-f835f927e137	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-29 19:02:49.548478+08	exit	exit	91.80	\N	authorized	f	f
17537a6f-67f7-4af9-ae87-47a840a13112	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-28 23:58:05.548478+08	exit	exit	99.40	\N	authorized	f	f
63980cbe-019d-4563-885b-743c0d772220	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-28 16:57:17.548478+08	entry	entry	88.91	\N	authorized	f	f
2061a2e8-5505-4510-b556-b2d7da9f29c7	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-04-28 22:06:26.548478+08	exit	exit	92.71	\N	authorized	f	f
352abcb7-36cd-46a3-90fc-3dc887b74412	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-28 15:01:58.548478+08	exit	exit	97.36	\N	authorized	f	f
e64ff89c-479b-4e5e-b689-3fe3283bfd3d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-28 16:40:08.548478+08	entry	entry	93.34	\N	authorized	f	f
545293ad-1165-4b9a-889d-2acbd8d0f69b	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-28 23:35:49.548478+08	entry	entry	88.32	\N	authorized	f	f
c32da3a2-f25b-4061-a687-be2b2b4fd0d4	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-28 19:54:04.548478+08	exit	exit	86.76	\N	authorized	f	f
13adaed9-f959-4219-ac8e-b5cc13ce0dd3	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-28 14:14:01.548478+08	entry	entry	92.13	\N	authorized	f	f
75c1a546-9a99-4bbe-9f77-73f30fdc2757	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-04-28 08:30:24.548478+08	exit	exit	85.01	\N	authorized	f	f
33c84ed9-0c43-4fc0-a87f-192cbc439c31	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-29 00:59:55.548478+08	entry	entry	95.02	\N	authorized	f	f
1880fa60-2d02-4509-97f9-ccefef0f94ad	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-28 23:08:02.548478+08	exit	exit	92.90	\N	authorized	f	f
bc76f037-2ba9-479b-a6f9-82a09439ff43	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-29 01:06:33.548478+08	entry	entry	90.15	\N	authorized	f	f
046fb36b-b9f8-4fcf-ab66-e09141fbe5f2	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-28 15:45:05.548478+08	exit	exit	94.35	\N	authorized	f	f
7fd6d2dc-641c-4274-91e0-577b0e54845d	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-29 00:49:53.548478+08	exit	exit	89.37	\N	authorized	f	f
40b817c6-626d-4af8-91f8-50ef0a757542	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-28 15:34:07.548478+08	exit	exit	91.66	\N	authorized	f	f
c522f828-d4dc-430f-ba19-cb8626c87e17	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-28 16:46:54.548478+08	exit	exit	95.11	\N	authorized	f	f
4eb4d151-2e4f-4700-9e87-bb73c94f7edb	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-28 17:51:21.548478+08	exit	exit	99.44	\N	authorized	f	f
0a1e11dd-d55c-4d47-b194-a813b0d3c9ad	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-28 23:32:49.548478+08	entry	entry	95.87	\N	authorized	f	f
e3ab7cae-9f7b-4685-a9e5-b46d4490564b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-28 16:41:03.548478+08	entry	entry	87.62	\N	authorized	f	f
fb2d676a-4e0f-4162-b6e6-2e99e2b95719	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-28 23:30:53.548478+08	entry	entry	99.05	\N	authorized	f	f
e30b7834-79c8-4dfb-97dd-7ebbf3c63b20	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-28 23:22:22.548478+08	entry	entry	99.37	\N	authorized	f	f
25f82f96-9e75-4ddc-aac7-27ed7b884504	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-27 15:14:45.548478+08	entry	entry	91.79	\N	authorized	f	f
588848ce-6b1a-4a48-b2ec-d42686b9c15c	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-28 01:28:24.548478+08	entry	entry	95.87	\N	authorized	f	f
aac1bc04-e051-4360-a7e6-281a99cb8a58	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-04-27 12:56:43.548478+08	entry	entry	98.56	\N	authorized	f	f
53db414f-933a-4caa-afff-c15bdf7be86e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-27 21:47:22.548478+08	exit	exit	96.13	\N	authorized	f	f
22cc6dbb-457f-44ae-9e36-39e13fe65123	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-27 18:49:24.548478+08	entry	entry	88.37	\N	authorized	f	f
7023b577-d82b-4988-9c11-90cecac2c3e5	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-27 17:22:09.548478+08	entry	entry	91.14	\N	authorized	f	f
c62be278-53b3-4f37-b468-c01f93b8fb1d	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-04-27 15:41:11.548478+08	exit	exit	85.67	\N	authorized	f	f
9aa7778e-122c-4551-83c1-b98abc39253d	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-27 22:22:52.548478+08	exit	exit	87.34	\N	authorized	f	f
242f3f57-0e10-428e-becd-21b1892dbddc	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-28 03:28:57.548478+08	entry	entry	86.61	\N	authorized	f	f
02715d83-caf7-4969-896b-bc9ee2f5da38	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-27 13:18:13.548478+08	entry	entry	99.29	\N	authorized	f	f
a8fc6a36-0327-45dd-917f-ac3a997082a5	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-04-27 17:19:56.548478+08	entry	entry	86.36	\N	authorized	f	f
d8c227d3-d74e-4e72-8d2f-bbfe6c7d8b60	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-28 01:28:18.548478+08	entry	entry	87.20	\N	authorized	f	f
0b25703e-5887-4154-b1ee-92c1aa619749	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-27 23:59:36.548478+08	entry	entry	96.34	\N	authorized	f	f
bb80a4aa-a211-4fdd-926a-dcfeacc8115a	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-27 15:27:14.548478+08	entry	entry	94.75	\N	authorized	f	f
bc0bd58d-eaa6-43d8-8e19-0914361c0f97	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-28 00:31:17.548478+08	exit	exit	98.82	\N	authorized	f	f
65ba2e08-05ec-44ce-a5c5-7413164be7d3	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-28 00:02:32.548478+08	entry	entry	90.29	\N	authorized	f	f
40bf20ba-572a-4000-b0b4-03ccc1971d3e	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-27 16:41:03.548478+08	exit	exit	88.34	\N	authorized	f	f
76184859-d8f5-44a3-a4fc-e0cb136e847d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-28 00:54:57.548478+08	exit	exit	88.62	\N	authorized	f	f
f2d2ab33-a61a-4fd7-8466-8d93741a4bd3	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-27 12:30:34.548478+08	entry	entry	86.96	\N	authorized	f	f
01736003-fee8-4708-b6e6-1878054e8606	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-27 22:56:56.548478+08	entry	entry	91.57	\N	authorized	f	f
19fed2be-febe-4754-9b12-fe3fda6d4b56	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-27 17:06:22.548478+08	exit	exit	91.88	\N	authorized	f	f
03622b23-c874-4b2c-962c-ff46ce9e7bf4	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-27 19:41:51.548478+08	exit	exit	86.33	\N	authorized	f	f
ef4b3de8-822a-4010-97ef-3be70ed5ca52	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-27 22:00:49.548478+08	entry	entry	94.03	\N	authorized	f	f
7a2c75d1-b83a-471b-abf5-a997079c17d1	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-27 00:34:23.548478+08	exit	exit	95.80	\N	authorized	f	f
9e006b91-47ca-4285-b9fd-8fc29c28f4a6	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-26 16:58:47.548478+08	exit	exit	89.10	\N	authorized	f	f
ccfffc97-3e48-421c-a03b-847c172fbbde	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-26 15:40:46.548478+08	entry	entry	90.38	\N	authorized	f	f
2bc92382-e7e5-438d-a8bc-5ae1115057a4	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-26 23:13:09.548478+08	entry	entry	93.34	\N	authorized	f	f
e98b94da-d869-45a7-8d1a-68e909cd2642	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-26 15:23:41.548478+08	entry	entry	87.69	\N	authorized	f	f
9311a01e-170d-4337-ad26-e9d44f0576dc	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-26 15:37:11.548478+08	exit	exit	93.24	\N	authorized	f	f
aec92622-ad7f-4a0b-8454-ab55a4da67d8	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-26 06:59:46.548478+08	entry	entry	92.01	\N	authorized	f	f
1266be54-01ad-4ac0-96fe-127b245a2afa	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-26 00:56:10.548478+08	entry	entry	92.82	\N	authorized	f	f
a40cb0e3-abd6-4f94-86af-685891e4c087	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-25 15:39:27.548478+08	exit	exit	92.80	\N	authorized	f	f
acb1809f-0c49-4e3a-8bc8-f793ee58010c	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-25 21:11:30.548478+08	entry	entry	91.14	\N	authorized	f	f
3131c039-cec0-4e6f-b83f-bb1669438967	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-25 16:30:28.548478+08	exit	exit	91.15	\N	authorized	f	f
a33fc6ee-7051-4ee0-909a-bfdb8b29ecfb	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-25 23:43:55.548478+08	entry	entry	90.73	\N	authorized	f	f
23f219d5-54d7-4856-b180-fec669194b6e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-25 16:14:19.548478+08	exit	exit	97.11	\N	authorized	f	f
b1638334-8969-4fa2-942a-34239aee6073	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-25 23:26:50.548478+08	exit	exit	88.66	\N	authorized	f	f
2cf9dd76-31db-46f0-9d00-a762e92b949a	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-25 23:37:34.548478+08	exit	exit	86.53	\N	authorized	f	f
add45a05-1686-4f19-8da1-4e109cd84940	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-25 16:22:18.548478+08	entry	entry	97.43	\N	authorized	f	f
8a39cd96-6ca8-468f-82ed-2175a7ee6de7	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-25 21:07:10.548478+08	entry	entry	93.36	\N	authorized	f	f
b319cd17-a601-42cd-84e5-e62ec889dbee	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-25 14:06:18.548478+08	entry	entry	94.03	\N	authorized	f	f
a8e682c2-bbce-4844-8b28-211bd395187c	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-26 05:19:33.548478+08	exit	exit	87.10	\N	authorized	f	f
b7c79af2-0114-40c9-8523-b09308ca0cb7	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-04-24 22:33:18.548478+08	exit	exit	92.54	\N	authorized	f	f
6298d0f9-8f9c-4a38-beab-ae48c6513b02	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-24 18:18:36.548478+08	entry	entry	94.90	\N	authorized	f	f
ba1abf3f-5e9a-4f53-a5f9-44a3fbef56a0	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-24 23:57:52.548478+08	exit	exit	94.29	\N	authorized	f	f
6b5380db-440a-452f-9409-7fd22482ab3f	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-24 22:40:05.548478+08	exit	exit	93.98	\N	authorized	f	f
9375e30e-0199-4391-be4c-c2fa58cd587a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-24 14:17:38.548478+08	entry	entry	97.80	\N	authorized	f	f
ca9b07fe-c419-4e04-9453-0f60f9c05045	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-24 19:57:19.548478+08	exit	exit	86.72	\N	authorized	f	f
b991f7ce-1605-4cad-b539-2a9f679b74cc	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-24 08:43:57.548478+08	entry	entry	94.94	\N	authorized	f	f
96eea377-d4a9-463a-8540-36fce836364e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-24 15:14:03.548478+08	entry	entry	86.86	\N	authorized	f	f
5a123b08-8600-48f5-bb6a-652c90b49180	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-24 21:05:16.548478+08	exit	exit	96.47	\N	authorized	f	f
b1e97157-e771-48c8-b3db-c4f5099e61bf	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-24 21:54:05.548478+08	exit	exit	92.99	\N	authorized	f	f
a724b0b5-5683-4222-a445-83037874213b	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-25 00:16:12.548478+08	entry	entry	94.72	\N	authorized	f	f
d7f6ae90-478d-4f63-b888-b8a12f60e857	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-24 14:43:46.548478+08	exit	exit	97.65	\N	authorized	f	f
c46c7983-5b41-4caf-93b7-eb799930faf4	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-24 15:46:50.548478+08	exit	exit	89.85	\N	authorized	f	f
1c4d8119-57f7-4b06-8973-70769b86f1ec	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-24 16:46:06.548478+08	entry	entry	87.24	\N	authorized	f	f
221b549a-f523-49a7-aad3-dac10153b98d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-24 23:15:40.548478+08	exit	exit	96.50	\N	authorized	f	f
2eae774d-0286-4b0c-a716-786d828b2b06	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-24 21:43:03.548478+08	exit	exit	89.46	\N	authorized	f	f
9bcf8e61-c8bb-44af-ad5c-266233f9d88e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-24 09:23:44.548478+08	exit	exit	87.91	\N	authorized	f	f
780cf3ac-c8d5-41e0-8ad4-a8dbbc5a6164	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-25 01:59:13.548478+08	exit	exit	98.23	\N	authorized	f	f
aaab2006-d3cd-4f47-abd5-caa806f4e2b7	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-24 19:15:46.548478+08	exit	exit	95.17	\N	authorized	f	f
072c2dce-cd8d-4c99-bf27-395dbaba2486	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-24 21:54:01.548478+08	entry	entry	89.06	\N	authorized	f	f
6b7df4ab-3945-49aa-ae78-9409029fac60	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-24 08:38:58.548478+08	entry	entry	88.89	\N	authorized	f	f
f1f17452-7c27-4487-86e6-25f22ff55a2e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-25 00:12:57.548478+08	exit	exit	93.49	\N	authorized	f	f
aa3c9502-c93a-4162-9cb5-9867267147d8	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-24 22:19:08.548478+08	entry	entry	90.77	\N	authorized	f	f
b47aa359-f0d4-4819-8012-139bc2903619	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-24 00:05:01.548478+08	exit	exit	98.80	\N	authorized	f	f
831ca97a-d759-4ec0-8cbd-2898be80ee4e	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-23 19:19:28.548478+08	entry	entry	92.27	\N	authorized	f	f
b81fe327-1077-4991-b90f-56fb53d16ae4	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-23 18:47:16.548478+08	entry	entry	88.97	\N	authorized	f	f
40dfea14-4a84-4d01-acca-2e9bdff33e57	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-23 17:25:35.548478+08	exit	exit	94.68	\N	authorized	f	f
871311a1-785e-43d9-91f3-efd9d9318201	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-23 15:59:52.548478+08	entry	entry	99.55	\N	authorized	f	f
59c4ca1f-e319-45a5-9410-e6e8088833d4	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-23 23:55:40.548478+08	exit	exit	96.51	\N	authorized	f	f
b138d36a-017d-4656-8419-5ae2eb9cbc01	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-24 00:44:59.548478+08	exit	exit	90.80	\N	authorized	f	f
44a81698-7f3f-4c20-8680-d21c0fe17358	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-23 17:05:01.548478+08	entry	entry	98.27	\N	authorized	f	f
af2aa865-5167-4cc6-9112-39664be121fd	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-23 14:47:44.548478+08	exit	exit	91.22	\N	authorized	f	f
cd916ef5-cec8-4440-a85c-2874089b8ae0	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-24 01:25:02.548478+08	entry	entry	99.71	\N	authorized	f	f
2bb322bc-7255-488e-9ab9-93a08c5082e0	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-04-23 21:03:43.548478+08	entry	entry	87.87	\N	authorized	f	f
b01c6488-4b71-4989-886e-106d4e1a16fb	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-23 16:16:00.548478+08	exit	exit	94.21	\N	authorized	f	f
35ac8a6e-e531-4e30-b2f5-fc48f3563ebb	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-23 15:32:02.548478+08	exit	exit	88.89	\N	authorized	f	f
86a68d46-9a42-4bd2-bce8-5a32a4879965	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-23 16:51:31.548478+08	entry	entry	99.69	\N	authorized	f	f
b7c0469c-b81b-43f0-914d-520ed4751630	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-23 16:47:24.548478+08	exit	exit	94.39	\N	authorized	f	f
aeb1f729-505a-46fd-8987-bc45db355b73	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-04-24 00:49:06.548478+08	entry	entry	94.24	\N	authorized	f	f
f61aa507-638b-4f74-af2b-83fcda83cdcd	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-23 22:44:17.548478+08	entry	entry	91.97	\N	authorized	f	f
442f2693-70bb-4c7b-b9d3-dbd12b3b279e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-23 23:31:41.548478+08	entry	entry	98.43	\N	authorized	f	f
1400f784-7c0b-495e-a2c0-2d052aefbaae	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-23 22:21:11.548478+08	exit	exit	89.08	\N	authorized	f	f
8935f785-18cc-4fc8-b18c-ac3cd09cb333	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-23 20:48:01.548478+08	entry	entry	86.94	\N	authorized	f	f
4faf2873-a705-4c6a-a71a-deb09ee0dd4a	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-23 22:58:31.548478+08	exit	exit	92.59	\N	authorized	f	f
2c5f2690-4901-4c8f-bfb5-ff099e22adf3	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-23 23:32:41.548478+08	exit	exit	89.39	\N	authorized	f	f
5d793498-21bc-44a8-98bb-0e3753c2e4b2	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-22 22:42:15.548478+08	exit	exit	87.94	\N	authorized	f	f
deb29b5d-8775-4f63-81b8-6f2efa6b279d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-22 10:21:20.548478+08	entry	entry	94.94	\N	authorized	f	f
170238d6-9a66-4a6b-b444-f3fd583155ed	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-22 14:53:58.548478+08	entry	entry	98.25	\N	authorized	f	f
83127086-e401-4358-96d5-1085b70c9cb0	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-22 20:31:46.548478+08	entry	entry	91.02	\N	authorized	f	f
518202fe-a160-4684-a510-814a5335f926	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-23 00:00:11.548478+08	entry	entry	97.92	\N	authorized	f	f
be1e9567-26a8-4885-acab-cae36bf7c1d2	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-22 21:14:13.548478+08	entry	entry	96.82	\N	authorized	f	f
45e8b406-8446-4f66-9095-4d005101a722	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-22 22:55:50.548478+08	exit	exit	85.73	\N	authorized	f	f
c13def27-4c69-41b4-a020-ef204f1ac1a8	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-23 06:54:14.548478+08	entry	entry	85.50	\N	authorized	f	f
302a881d-853d-4edb-b9d0-4475ca665539	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-22 21:13:28.548478+08	entry	entry	88.94	\N	authorized	f	f
b816989c-069f-4ad9-87bd-af364949a0d4	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-22 21:43:57.548478+08	entry	entry	90.65	\N	authorized	f	f
9fa9ff31-ebb5-4508-abbe-6d599a7d37fd	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-22 15:21:34.548478+08	entry	entry	99.75	\N	authorized	f	f
bb0bbd37-f5d8-4246-bfa9-e79052eeb058	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-22 16:26:36.548478+08	exit	exit	86.74	\N	authorized	f	f
cb7067d9-031a-434a-be2c-9b3393dbdf1e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-04-22 18:42:01.548478+08	exit	exit	97.51	\N	authorized	f	f
d833aadf-40cf-43af-a51d-e15ef2306a62	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-22 17:07:42.548478+08	exit	exit	94.35	\N	authorized	f	f
74541689-7ec3-4723-ac78-9c896771748c	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-22 21:56:03.548478+08	entry	entry	90.85	\N	authorized	f	f
4dd5f186-4dd8-43e1-b26b-51c74003790f	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-22 17:10:15.548478+08	entry	entry	99.03	\N	authorized	f	f
b17b049d-7a43-4ccf-a17a-b671251e4826	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-22 18:54:54.548478+08	entry	entry	92.41	\N	authorized	f	f
1649aaa5-2ff5-49ff-93bc-dc1fb33a2da6	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-23 03:15:41.548478+08	entry	entry	86.32	\N	authorized	f	f
9d30bfe2-73e8-4c5a-9cc1-fb8f04fa5a2e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-23 04:19:25.548478+08	exit	exit	99.13	\N	authorized	f	f
f74954e2-ae6e-4ba0-a444-f31189bc858d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-22 14:09:09.548478+08	entry	entry	86.64	\N	authorized	f	f
714aa6bc-0f28-4a8e-9050-0b31f3e6e383	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-22 15:08:39.548478+08	entry	entry	89.04	\N	authorized	f	f
09405648-3d52-47e6-b00f-735f9800b0d1	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-23 03:27:00.548478+08	entry	entry	91.19	\N	authorized	f	f
3eef9f05-e838-4bb2-ae5b-921b2998c2b1	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-23 07:04:09.548478+08	exit	exit	87.17	\N	authorized	f	f
a67ec2cb-c789-4145-b132-e46205d9bdef	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-04-23 00:58:26.548478+08	exit	exit	93.32	\N	authorized	f	f
5ea5dc23-a780-4e3c-835b-18462239bfbe	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-22 21:46:50.548478+08	entry	entry	98.65	\N	authorized	f	f
28010c39-8358-46e0-a884-945ae8cf3d45	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-04-22 15:22:57.548478+08	entry	entry	87.69	\N	authorized	f	f
fc424797-cf1c-48e9-a3c1-c61a12d9bff1	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-04-22 23:49:12.548478+08	entry	entry	94.99	\N	authorized	f	f
50014765-8f1f-40f9-a8c4-3f968747bf2a	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-22 14:31:28.548478+08	exit	exit	87.82	\N	authorized	f	f
571cea78-0b7e-43da-9f90-dc56ed2e87b7	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-21 22:40:36.548478+08	entry	entry	92.67	\N	authorized	f	f
1ef6f147-7367-4225-a7eb-ba82b4ba01c2	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-21 14:25:10.548478+08	entry	entry	95.03	\N	authorized	f	f
c603bc62-0f5f-4e11-b214-3e20c2d6c9af	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-21 18:14:43.548478+08	entry	entry	89.59	\N	authorized	f	f
ad86c412-001e-4dbc-8305-32df39d8db71	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-21 17:53:46.548478+08	entry	entry	95.07	\N	authorized	f	f
941634e2-3692-440d-8cb9-916fcedafa3b	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	MXA 7486	00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	2026-04-21 13:27:36.548478+08	entry	entry	96.48	\N	authorized	f	f
a0c390a5-0681-4d39-9f0b-5e91efadd061	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-21 17:32:18.548478+08	entry	entry	98.46	\N	authorized	f	f
da69e6e4-68bc-4e59-957b-561acd86305f	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-22 00:14:45.548478+08	exit	exit	94.69	\N	authorized	f	f
c835b638-4e2f-4b19-ac7f-3eac8079d84a	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-04-21 21:09:00.548478+08	exit	exit	91.69	\N	authorized	f	f
322d9d2a-bc58-42be-ad62-2334f13750de	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-21 15:37:50.548478+08	exit	exit	94.06	\N	authorized	f	f
7bded711-efc6-4111-8ea4-0abee1d59c17	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-21 17:54:04.548478+08	entry	entry	87.71	\N	authorized	f	f
46a3caaa-fd67-4478-b69a-8b3782e590cb	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-21 16:49:06.548478+08	entry	entry	96.73	\N	authorized	f	f
aaf89046-5848-489d-9860-b5dc84a89c0f	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-21 17:48:47.548478+08	exit	exit	90.04	\N	authorized	f	f
58afe41c-ee6e-4751-b3e6-da88a5b31ef9	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-21 15:31:59.548478+08	entry	entry	95.36	\N	authorized	f	f
9e302b3b-bd23-4913-bbd2-0f9923f9f3fb	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-22 05:25:21.548478+08	entry	entry	86.56	\N	authorized	f	f
a225d064-5e2e-4ce5-acf1-295c19556192	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-21 13:39:09.548478+08	exit	exit	92.09	\N	authorized	f	f
40709c7c-aab8-44c4-b7e2-d25f4d38d3c1	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-21 15:40:54.548478+08	exit	exit	91.02	\N	authorized	f	f
dd6b2d67-5a15-4a48-8844-e15f8ba99a3d	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-22 01:23:23.548478+08	entry	entry	97.24	\N	authorized	f	f
a1a5f71b-a0c9-4c4c-99de-ed7f31f66f49	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-22 00:16:49.548478+08	entry	entry	90.42	\N	authorized	f	f
bf9bd62b-4d91-4bd5-96fc-c688211edae4	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-21 16:44:57.548478+08	entry	entry	90.00	\N	authorized	f	f
3e2e18fd-9ca7-4787-b703-a41bc6fdadf2	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-21 15:24:51.548478+08	entry	entry	94.30	\N	authorized	f	f
b181bf84-a846-4c20-8fc3-a3b862d3270a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-04-21 19:43:00.548478+08	entry	entry	95.18	\N	authorized	f	f
14c80e92-3ac6-451a-b079-d354bc0055f6	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-22 02:51:00.548478+08	entry	entry	98.92	\N	authorized	f	f
f9f9331c-545f-44e1-a7cf-8579767a1969	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-21 15:49:58.548478+08	exit	exit	96.54	\N	authorized	f	f
f3c8decd-f37f-479c-bd94-58c4d34af79e	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-21 16:59:29.548478+08	exit	exit	90.69	\N	authorized	f	f
df0549b2-7028-491b-99ee-8b4319459e64	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-22 07:04:59.548478+08	entry	entry	96.11	\N	authorized	f	f
992bc477-8202-478c-b310-123c8bb4890e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-21 15:49:42.548478+08	entry	entry	89.76	\N	authorized	f	f
bb54cf9f-8b2e-4563-8d1a-dbc4c742503c	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-21 18:47:58.548478+08	exit	exit	94.03	\N	authorized	f	f
c71abc7f-6d35-4e54-960f-a18e7e9eeefa	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-21 14:47:12.548478+08	exit	exit	90.20	\N	authorized	f	f
dd525015-7a58-471b-b519-49b6c3d9911a	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-21 15:56:26.548478+08	entry	entry	88.98	\N	authorized	f	f
0485b709-5453-4810-ae17-68a98b567bd2	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-04-22 00:48:28.548478+08	entry	entry	97.07	\N	authorized	f	f
361a1104-cc6a-4190-996e-8deb75cf3d11	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-04-21 08:18:09.548478+08	exit	exit	91.69	\N	authorized	f	f
2bb4f3c0-5ec3-4a45-9b42-424684eca34b	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-22 06:46:47.548478+08	exit	exit	85.70	\N	authorized	f	f
73d01071-3c3e-4af4-b714-1d7633dbacfa	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-20 21:57:38.548478+08	entry	entry	93.27	\N	authorized	f	f
6dd15f2d-c445-47fb-b789-d1e2995c93fe	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-20 17:33:05.548478+08	exit	exit	93.18	\N	authorized	f	f
e3f8df74-a5e5-4d7a-bb21-35345b988ca2	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-20 16:06:35.548478+08	exit	exit	93.18	\N	authorized	f	f
653a4c95-49bc-4bc0-86f9-d9244c11e37e	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-20 22:26:33.548478+08	exit	exit	94.23	\N	authorized	f	f
f740fcd5-6256-4a5f-b5c4-3152f59995b9	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-20 18:11:50.548478+08	entry	entry	98.73	\N	authorized	f	f
3217d087-e59a-43ba-b331-7d127f69c153	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-20 14:19:08.548478+08	entry	entry	91.86	\N	authorized	f	f
b36816dd-a25f-499f-a54c-5b4885c8d9d6	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-21 04:29:20.548478+08	exit	exit	93.79	\N	authorized	f	f
f5cceff7-e927-487a-a4e0-c91fbfac3c77	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-20 16:09:36.548478+08	exit	exit	88.36	\N	authorized	f	f
62188e8f-b9c1-4fae-8b02-d72f157a9f9b	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UAA 4380	2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	2026-04-20 23:53:10.548478+08	entry	entry	87.60	\N	authorized	f	f
2bf0b001-bf01-4012-a967-3b959fe1a313	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-20 15:59:51.548478+08	entry	entry	85.61	\N	authorized	f	f
4df9b011-2077-4049-8353-24e78413fe5d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-21 04:09:19.548478+08	exit	exit	93.91	\N	authorized	f	f
54c1f15c-ce61-45ee-b7a7-402e7bfdcf83	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-20 18:29:52.548478+08	entry	entry	87.93	\N	authorized	f	f
2442a435-22d2-4285-98c6-fdcb20f38985	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-04-21 00:52:59.548478+08	exit	exit	95.68	\N	authorized	f	f
8114637a-f3fc-420c-8bd0-90f6653f0aa8	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-20 22:48:41.548478+08	exit	exit	97.46	\N	authorized	f	f
1c0526f9-1390-405a-a72f-4b978123e593	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	TTF 9672	862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	2026-04-20 23:47:23.548478+08	exit	exit	99.27	\N	authorized	f	f
f63ad472-23c5-48ea-88b1-899c35b7a031	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-20 17:59:29.548478+08	entry	entry	94.88	\N	authorized	f	f
36a1c0ca-183d-4c0f-96f8-28c633f8246d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-04-20 23:24:40.548478+08	entry	entry	98.68	\N	authorized	f	f
1922f6be-1dcf-4116-af40-9feb6ed992eb	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-21 00:57:30.548478+08	entry	entry	98.16	\N	authorized	f	f
3f16d9c7-fb6a-4163-b2e2-f9e66510f161	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-20 19:26:57.548478+08	exit	exit	90.03	\N	authorized	f	f
f518f5b6-ced9-42ba-8be8-229d6df9c7f6	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-20 16:40:46.548478+08	exit	exit	88.91	\N	authorized	f	f
fccd8afe-10c2-44ab-8ac6-b55f3c560c84	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-20 16:31:58.548478+08	entry	entry	92.13	\N	authorized	f	f
e3788336-67b8-4b9b-b0ca-cabf7cb74b71	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	XEA 5924	f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	2026-04-20 23:12:33.548478+08	exit	exit	93.86	\N	authorized	f	f
a44ee49f-1e65-41a8-bf31-cb8137f9ccde	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-20 21:47:54.548478+08	entry	entry	91.07	\N	authorized	f	f
d4775a67-86d8-41e6-96b4-2e3f59dea347	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-20 23:59:53.548478+08	exit	exit	90.30	\N	authorized	f	f
b9712c3a-c757-488e-9b11-de77d6cd6d29	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-20 23:05:27.548478+08	entry	entry	99.04	\N	authorized	f	f
244daeb0-8bf5-4030-ad63-8ee0484b62f8	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	IRI 6514	cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	2026-04-20 17:51:17.548478+08	exit	exit	90.73	\N	authorized	f	f
08fe82cc-0b64-4147-a6a9-4ec98ab9c05f	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	JIG 1791	840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	2026-04-20 22:13:29.548478+08	exit	exit	95.63	\N	authorized	f	f
dd5ce685-6005-4dad-8fd4-9020ef28c90a	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-20 17:22:49.548478+08	entry	entry	89.74	\N	authorized	f	f
53c54ae6-fa44-41db-9f08-db6c528c5421	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-20 12:55:53.548478+08	exit	exit	94.85	\N	authorized	f	f
a5594476-adb4-4dc4-98a2-1ada8626ef2b	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-20 21:18:30.548478+08	exit	exit	97.97	\N	authorized	f	f
db9406bc-670c-45fb-801a-de6592765021	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-21 00:23:22.548478+08	exit	exit	88.01	\N	authorized	f	f
b5e9dabd-447e-49eb-af65-6250516812e5	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	RPM 6768	f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	2026-04-20 15:44:46.548478+08	exit	exit	85.53	\N	authorized	f	f
c0b160dc-5394-4b25-b478-76273b64f6e3	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	XHU 1505	18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	2026-04-21 02:58:44.548478+08	entry	entry	95.50	\N	authorized	f	f
8d20d6b6-b49b-42a0-8471-9254083c169c	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-20 16:38:48.548478+08	exit	exit	87.79	\N	authorized	f	f
926cf064-0fc2-4213-883d-6f7d96f810b4	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-20 14:37:54.548478+08	entry	entry	94.12	\N	authorized	f	f
df165a6b-8935-475a-bea9-7e911d1dd115	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	JNG 7377	6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	2026-04-20 16:27:24.548478+08	entry	entry	97.43	\N	authorized	f	f
555ea277-c1ad-4ed9-8a15-491eedd09a41	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-20 17:31:40.548478+08	exit	exit	85.14	\N	authorized	f	f
8e2b1786-e836-4b1d-acdd-5dd5aceebd92	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-20 16:13:45.548478+08	entry	entry	91.63	\N	authorized	f	f
f64ed140-4c1f-48d6-8af1-c01b1d479b45	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	SOG 7886	5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	2026-04-20 22:06:50.548478+08	exit	exit	93.07	\N	authorized	f	f
bcd3ef85-0213-4d4d-b33f-dd295a5ec22c	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	UCX 8013	0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	2026-04-19 22:09:22.548478+08	entry	entry	92.80	\N	authorized	f	f
e10b6435-6440-43fa-974e-898c287098c1	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	NQR 4972	f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	2026-04-19 14:51:36.548478+08	exit	exit	95.30	\N	authorized	f	f
029f4576-bcb7-4671-84e1-3956ef7f6d57	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-19 14:14:41.548478+08	exit	exit	92.34	\N	authorized	f	f
7622da65-1540-4103-b3de-0e3e1f0337a8	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-19 15:41:37.548478+08	entry	entry	92.47	\N	authorized	f	f
3fde30a7-01df-41be-9c3e-b7c09c697e90	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	CHN 2826	32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	2026-04-19 12:54:25.548478+08	exit	exit	86.68	\N	authorized	f	f
8cc5410d-30ec-4be6-9284-c61d171e3654	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	EAR 8304	ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	2026-04-19 23:48:27.548478+08	exit	exit	97.98	\N	authorized	f	f
0934c2b2-89a8-4e15-90a2-3d1012cca11f	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	RCF 4361	dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	2026-04-20 01:46:46.548478+08	exit	exit	86.48	\N	authorized	f	f
dbc55af3-6780-47a0-9cf8-6332ba41803c	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 07:05:46+08	entry	entry	95.12	\N	authorized	f	f
388223c2-2c0c-47b5-8316-df766eae928b	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 08:15:12+08	exit	exit	97.90	\N	authorized	f	f
5f2916af-0e10-40f0-b744-170b3561d344	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 09:30:24+08	entry	entry	94.08	\N	authorized	f	f
55128e8b-feb5-4983-8876-6c57b5d71c38	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 11:20:08+08	exit	exit	93.44	\N	authorized	f	f
593cfea8-dc35-486d-96e5-6c58fa094fde	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 13:15:42+08	entry	entry	99.33	\N	authorized	f	f
29613aef-eae2-4d3e-9072-105d8090604d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 15:45:07+08	exit	exit	96.68	\N	authorized	f	f
1d9f5362-4ffa-48ca-8d00-679cdf6858e4	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 16:10:37+08	entry	entry	92.67	\N	authorized	f	f
7b020a92-251d-4fa8-bc67-231802e692fd	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 17:30:47+08	exit	exit	98.43	\N	authorized	f	f
e0f42280-1a12-49d3-ab50-12b78402942f	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 18:45:56+08	entry	entry	97.38	\N	authorized	f	f
e61f19b0-3cf9-47d2-91ea-a6398f311d4c	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 21:15:52+08	exit	exit	94.00	\N	authorized	f	f
7c18e649-81ab-4d8c-a528-5770a3ae488f	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 22:30:40+08	entry	entry	97.73	\N	authorized	f	f
064a912f-27a3-4cf5-a4c1-090b186cfa7d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-18 23:50:59+08	exit	exit	92.07	\N	authorized	f	f
7be30595-c39e-4b17-a474-9d788de15ee9	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 07:05:59+08	entry	entry	96.72	\N	authorized	f	f
55b16c24-75f5-41b5-9c1f-ddc1e12875a6	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 08:15:01+08	exit	exit	94.89	\N	authorized	f	f
bae07656-b729-48c1-b992-c38aa41030d8	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 09:30:55+08	entry	entry	92.14	\N	authorized	f	f
8be7efe6-97d3-4203-b29d-3ca75c009388	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 11:20:51+08	exit	exit	99.04	\N	authorized	f	f
82bd0cf3-632f-409c-bbe3-0dff38c0a940	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 13:15:40+08	entry	entry	92.41	\N	authorized	f	f
0bbf41b6-2957-47ff-870b-a87eb228ff9f	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 15:45:03+08	exit	exit	99.61	\N	authorized	f	f
0cb3489f-ff38-4151-bced-59c6529f5280	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 16:10:07+08	entry	entry	93.84	\N	authorized	f	f
78d7280b-e390-4ae4-9c2b-e7d592ad38df	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 17:30:04+08	exit	exit	97.46	\N	authorized	f	f
5b26fc6f-af66-44be-92ec-2a35d8ea50dd	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 18:45:41+08	entry	entry	93.28	\N	authorized	f	f
4daddc93-2038-461d-b504-54979abb8181	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 21:15:53+08	exit	exit	93.29	\N	authorized	f	f
e1485a1c-2ef8-496b-87d2-f60f69eaf2fa	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 22:30:05+08	entry	entry	93.84	\N	authorized	f	f
aa665b12-8313-42b9-8c05-f7915dbb8929	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-17 23:50:25+08	exit	exit	95.44	\N	authorized	f	f
df234995-2210-40bb-9328-505ab68d6f1e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 07:05:36+08	entry	entry	96.22	\N	authorized	f	f
c0fe3e84-dd38-4519-bd41-fa812b56008e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 08:15:40+08	exit	exit	98.49	\N	authorized	f	f
df7d17a1-129b-49be-b1ad-016a7fe68256	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 09:30:53+08	entry	entry	99.62	\N	authorized	f	f
7817804e-4d8e-4b05-a9f2-df9a784423b9	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 11:20:40+08	exit	exit	98.91	\N	authorized	f	f
f9370703-d618-4924-9df2-e7e146acc158	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 13:15:19+08	entry	entry	96.04	\N	authorized	f	f
f3cb540d-5eab-46e8-a9c5-f99814b28123	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 15:45:10+08	exit	exit	93.53	\N	authorized	f	f
ceb81e57-4c94-4f4f-9848-efe569d88a96	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 16:10:37+08	entry	entry	96.27	\N	authorized	f	f
cf5c4848-b897-4b89-9bd3-cd9c00b2d3e6	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 17:30:38+08	exit	exit	96.56	\N	authorized	f	f
3117c0e1-9fd3-4e6f-a25c-7f96435bfbd7	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 18:45:01+08	entry	entry	97.09	\N	authorized	f	f
fb56e726-da3a-412a-b82c-72bb1a1c6a10	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 21:15:00+08	exit	exit	95.16	\N	authorized	f	f
33e4264e-23ee-470b-b6fa-9298b95b1892	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 22:30:01+08	entry	entry	99.42	\N	authorized	f	f
d62b4a0d-0ab8-4b30-a4be-40c0891ae0d3	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-16 23:50:23+08	exit	exit	92.59	\N	authorized	f	f
80fb48c7-a02e-4324-ae72-5a5f8ce8dc17	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 07:05:26+08	entry	entry	99.59	\N	authorized	f	f
549518ef-838a-4246-8538-091c69417e7e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 08:15:43+08	exit	exit	92.71	\N	authorized	f	f
b74a4b54-b4d0-4f2e-b5ef-eb7b2505a840	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 09:30:17+08	entry	entry	93.97	\N	authorized	f	f
a835248a-034e-4765-bc3b-604fced40bcd	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 11:20:32+08	exit	exit	95.71	\N	authorized	f	f
1634a448-9fb5-45bf-91ba-9dcef5047f22	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 13:15:56+08	entry	entry	97.60	\N	authorized	f	f
91188ef2-88be-4a8d-91f9-45ccb8c6a4ac	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 15:45:31+08	exit	exit	98.17	\N	authorized	f	f
f0a1fb13-9bbe-480f-9b96-c48d0de326e9	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 16:10:29+08	entry	entry	99.05	\N	authorized	f	f
fc60d606-8ed1-4c26-83b8-e758968692f2	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 17:30:03+08	exit	exit	93.30	\N	authorized	f	f
38387275-4ef1-46a8-a8e9-08047da3ef3d	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 18:45:09+08	entry	entry	94.25	\N	authorized	f	f
b69dc95a-19e4-43ec-aa59-e2098ac89fb7	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 21:15:56+08	exit	exit	97.74	\N	authorized	f	f
e36957dd-adb6-4886-bec6-0b6c58c9f8a3	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 22:30:47+08	entry	entry	96.10	\N	authorized	f	f
7209d807-31c8-4fc2-89d1-5b86e7615372	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	ITR 6180	006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	2026-05-15 23:50:24+08	exit	exit	95.93	\N	authorized	f	f
122912f3-0db1-4e3e-a7e5-db4c9a3770d0	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 07:10:01+08	entry	entry	99.23	\N	authorized	f	f
ed2d0140-1bd1-422e-973d-21c86921b011	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 08:20:40+08	exit	exit	93.56	\N	authorized	f	f
488f07db-4adc-40b3-af99-b4a3e4446e70	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 09:35:00+08	entry	entry	94.51	\N	authorized	f	f
d364fdab-5730-415e-bcf0-d4c3e2c225ea	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 11:15:52+08	exit	exit	95.08	\N	authorized	f	f
1945712d-874c-4578-b881-3f126e9508c5	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 13:20:06+08	entry	entry	98.92	\N	authorized	f	f
b8b14f7b-0669-47f2-b8e6-5f969887bc53	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 15:40:53+08	exit	exit	92.82	\N	authorized	f	f
90bcda96-0731-4dde-be19-dfbc4ea7fc89	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 16:15:06+08	entry	entry	95.42	\N	authorized	f	f
80048be3-5ebf-4d74-a445-79d774ca3082	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 17:25:48+08	exit	exit	98.91	\N	authorized	f	f
2163a172-c5ce-4aca-8a90-89efd44877d0	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 18:50:29+08	entry	entry	99.03	\N	authorized	f	f
c6617fc8-be6d-45a2-bcbc-9e6b10f17fc8	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 21:10:38+08	exit	exit	99.57	\N	authorized	f	f
388e35fe-2a60-494d-9705-b19b406e4f61	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 22:35:53+08	entry	entry	95.45	\N	authorized	f	f
b32b0cd3-cfd4-452b-b698-1345a14ebf72	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-18 23:45:43+08	exit	exit	92.19	\N	authorized	f	f
a9d19063-3f7b-4e47-89d2-15a76f634b23	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 07:10:30+08	entry	entry	99.77	\N	authorized	f	f
a44c9f9e-2a70-484c-8c68-85651ebb6109	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 08:20:42+08	exit	exit	93.67	\N	authorized	f	f
616a3c72-15ca-4d03-b61e-a83817ed9f21	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 09:35:35+08	entry	entry	95.02	\N	authorized	f	f
7f9147fd-2a84-4235-86ae-77fb506b47d1	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 11:15:08+08	exit	exit	96.20	\N	authorized	f	f
cb0b2c01-4acd-4251-b077-eb19ad290567	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 13:20:35+08	entry	entry	98.33	\N	authorized	f	f
7df08a8d-39cc-4b76-bdcb-09ac6bf4f6e9	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 15:40:18+08	exit	exit	93.63	\N	authorized	f	f
455c0123-d390-4e20-95cf-b6088d8b6872	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 16:15:05+08	entry	entry	92.29	\N	authorized	f	f
b6c5a89d-d325-4f23-85b4-30f44f2a4fa8	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 17:25:41+08	exit	exit	95.82	\N	authorized	f	f
39bc8a1f-cb81-45e2-acd9-83516a652e65	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 18:50:29+08	entry	entry	96.25	\N	authorized	f	f
2b337338-9902-4a5e-a385-12efec21cad2	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 21:10:07+08	exit	exit	97.31	\N	authorized	f	f
3ca83d69-251d-4973-a1e7-f87e88d382b0	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 22:35:11+08	entry	entry	93.55	\N	authorized	f	f
66c550f1-1c00-4d38-be5f-975b323489c5	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-17 23:45:34+08	exit	exit	94.26	\N	authorized	f	f
c75a44be-d1e0-479e-95d8-29d7b15cfcbd	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 07:10:32+08	entry	entry	99.87	\N	authorized	f	f
f08a65ac-d0c6-4be9-8ecb-f275110ad0db	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 08:20:55+08	exit	exit	97.08	\N	authorized	f	f
fa5b36f9-ae3c-4777-b4f7-7f969c24251d	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 09:35:57+08	entry	entry	92.53	\N	authorized	f	f
c5cfa042-c51a-46ac-8437-aa3f706f5a52	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 11:15:32+08	exit	exit	98.82	\N	authorized	f	f
2cfc1100-e2fa-47dd-8aa7-e65cb239cb05	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 13:20:45+08	entry	entry	95.06	\N	authorized	f	f
c4415a6a-f22a-4603-8d4b-312383fe579d	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 15:40:31+08	exit	exit	93.51	\N	authorized	f	f
c93180be-7dff-4e8c-8e24-3f74d690fc9e	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 16:15:50+08	entry	entry	92.08	\N	authorized	f	f
83719ee3-9cf8-4544-b483-caec774431e2	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 17:25:51+08	exit	exit	95.35	\N	authorized	f	f
e2791a65-b584-4f71-a3f3-41a172ed4cd6	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 18:50:13+08	entry	entry	98.90	\N	authorized	f	f
28bd30de-12ec-4cf6-b75d-85c605cd422b	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 21:10:08+08	exit	exit	94.67	\N	authorized	f	f
5c758849-a00a-44f7-888f-1ea5300f8cbf	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 22:35:36+08	entry	entry	95.09	\N	authorized	f	f
6e86b992-2ef1-43cc-9d33-03c9fc302280	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-16 23:45:39+08	exit	exit	96.16	\N	authorized	f	f
a4feaff1-c1ab-4a8f-bd89-09f60fa5acbd	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 07:10:55+08	entry	entry	96.58	\N	authorized	f	f
1f1333f2-e3cd-4fa7-89a2-202952ef5788	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 08:20:04+08	exit	exit	98.76	\N	authorized	f	f
e9eeb127-b849-4738-ad7e-b9193f9bd266	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 09:35:43+08	entry	entry	94.95	\N	authorized	f	f
36016cc4-8f0e-40d6-aed2-34368adb912c	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 11:15:04+08	exit	exit	99.36	\N	authorized	f	f
bae99ad3-cca2-4fb0-940a-82d64f67d751	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 13:20:55+08	entry	entry	96.61	\N	authorized	f	f
b26d4a64-b855-40de-ae9c-378e801fa8c5	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 15:40:26+08	exit	exit	99.69	\N	authorized	f	f
ee598d5a-42d4-4ac6-bc54-86574eac809c	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 16:15:36+08	entry	entry	92.37	\N	authorized	f	f
61ca23bd-baaf-47e8-a403-17c06bd88a3d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 17:25:31+08	exit	exit	93.74	\N	authorized	f	f
2dec483f-d258-4a45-8a0f-347dcdf0ce17	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 18:50:02+08	entry	entry	98.36	\N	authorized	f	f
a5644c00-8041-45c6-8774-e9f130195a34	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 21:10:55+08	exit	exit	97.49	\N	authorized	f	f
be55351e-1647-423b-a091-80a60ffdde73	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 22:35:43+08	entry	entry	95.12	\N	authorized	f	f
c856bc27-b450-4b0c-9050-32a128451991	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	POX 9908	80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	2026-05-15 23:45:01+08	exit	exit	98.63	\N	authorized	f	f
29c2646a-57dd-4dab-8af5-2f5d732d1f4b	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 07:15:55+08	entry	entry	92.08	\N	authorized	f	f
cbc0b0ec-a8b0-47ee-8a03-3c4c07cced43	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 08:25:04+08	exit	exit	93.59	\N	authorized	f	f
ed90d393-4cc0-40dc-b028-bd444d27f2a2	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 09:40:52+08	entry	entry	96.17	\N	authorized	f	f
e38f21b3-aa47-4f2b-a4e1-61b9e54fb4f0	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 11:10:39+08	exit	exit	94.84	\N	authorized	f	f
1ec897b3-78ec-42cd-9c6b-51adb5a0688a	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 13:25:30+08	entry	entry	94.27	\N	authorized	f	f
1ce20b3c-92cf-439c-affa-a9d42f82a4d0	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 15:35:40+08	exit	exit	95.37	\N	authorized	f	f
477b7889-d21d-426f-bf9c-87c50b3f7a09	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 16:20:37+08	entry	entry	95.61	\N	authorized	f	f
203568b8-c7f9-488d-954c-266be3856187	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 17:20:14+08	exit	exit	92.50	\N	authorized	f	f
807cd189-7a45-4fae-bd12-624eb3fc384c	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 18:55:39+08	entry	entry	98.43	\N	authorized	f	f
1bfe8c2c-a984-40f7-8c17-95d8085fe267	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 21:05:41+08	exit	exit	97.18	\N	authorized	f	f
4a459ceb-553d-4b50-9d1c-048bc9a85a51	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 22:40:26+08	entry	entry	97.71	\N	authorized	f	f
f82d56d4-1aba-4cdd-a552-ece48e621876	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-18 23:40:44+08	exit	exit	97.42	\N	authorized	f	f
fc16e78e-1fa0-46f4-8e77-99e16c629779	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 07:15:34+08	entry	entry	95.75	\N	authorized	f	f
f3faac75-a578-4373-8240-e9ab54ecfc2a	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 08:25:30+08	exit	exit	98.47	\N	authorized	f	f
e28359f6-4f82-43d3-9588-cd8b962d6b6b	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 09:40:47+08	entry	entry	93.61	\N	authorized	f	f
a9f629ca-3713-4a86-afd2-3656b1f7e772	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 11:10:43+08	exit	exit	98.09	\N	authorized	f	f
d0c94581-47ea-4322-9aef-12d488765aca	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 13:25:41+08	entry	entry	99.75	\N	authorized	f	f
c4e0f16b-63ec-40e2-8dca-44ed18769011	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 15:35:55+08	exit	exit	94.67	\N	authorized	f	f
4c2ddb96-ea99-4cea-8029-4fdd50e46dbf	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 16:20:46+08	entry	entry	97.62	\N	authorized	f	f
adbe6ab8-1dd7-4371-b8e7-857ff65993df	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 17:20:57+08	exit	exit	98.16	\N	authorized	f	f
25e8a59d-adb2-456f-8de1-f8377c906eab	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 18:55:23+08	entry	entry	99.82	\N	authorized	f	f
744faca1-67e9-41a5-8502-260da4043cd3	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 21:05:41+08	exit	exit	93.04	\N	authorized	f	f
3419c9ec-62d6-4b0a-b3e9-360c26d64d6c	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 22:40:06+08	entry	entry	92.44	\N	authorized	f	f
dad83b2c-20b4-4937-b37c-67d6c66f4afc	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-17 23:40:11+08	exit	exit	95.77	\N	authorized	f	f
f058a33b-254f-498a-bf0c-6327847dc794	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 07:15:58+08	entry	entry	95.13	\N	authorized	f	f
833e57ac-e88b-418a-82c6-1b13a35e59a9	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 08:25:07+08	exit	exit	93.69	\N	authorized	f	f
6c7d5f1a-a8c2-462f-8f0c-e7ad41155d6e	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 09:40:38+08	entry	entry	96.26	\N	authorized	f	f
bbc68dd1-7861-4c00-989c-3a02e61fc354	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 11:10:21+08	exit	exit	92.40	\N	authorized	f	f
f3e4c9f1-4b98-451d-bbd1-057ed4861600	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 13:25:37+08	entry	entry	93.41	\N	authorized	f	f
76405627-735d-420d-b348-6415edb72f01	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 15:35:30+08	exit	exit	99.08	\N	authorized	f	f
9790793d-a614-4a7c-8d13-9c002572ecc7	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 16:20:10+08	entry	entry	97.18	\N	authorized	f	f
a194e971-c6bc-4698-8976-28f7db0adbfe	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 17:20:14+08	exit	exit	93.39	\N	authorized	f	f
e62b807e-b093-4d91-966b-415e2b60e7da	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 18:55:12+08	entry	entry	96.79	\N	authorized	f	f
8c696fd4-77ac-4044-84ad-873e4977ce5d	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 21:05:08+08	exit	exit	95.24	\N	authorized	f	f
862a4a66-4b00-4c98-8f31-127f74d27ef8	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 22:40:42+08	entry	entry	97.31	\N	authorized	f	f
22866c35-104e-4e23-8bce-b27233e9a5a6	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-16 23:40:45+08	exit	exit	99.11	\N	authorized	f	f
3c37ce7b-a90d-4af1-8290-aafbc1d8aa34	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 07:15:38+08	entry	entry	95.58	\N	authorized	f	f
5799d445-ece8-4226-b0ee-9021999b7957	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 08:25:59+08	exit	exit	96.02	\N	authorized	f	f
64be813b-fdbf-4002-a57e-b57fb2c969e0	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 09:40:02+08	entry	entry	95.91	\N	authorized	f	f
e40c5dfa-fc58-4e82-a35b-db3345c776fd	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 11:10:31+08	exit	exit	98.83	\N	authorized	f	f
850380bd-a7bd-41a3-a22d-85d8afc529b0	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 13:25:11+08	entry	entry	94.46	\N	authorized	f	f
e0779eb7-1b1d-4121-82f8-e50986f653f9	2594a749-a16d-46d3-b33c-2258f8d0047b	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 15:35:04+08	exit	exit	98.55	\N	authorized	f	f
10d040b3-55aa-41c7-9d3d-89aebc6c9ec3	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 16:20:30+08	entry	entry	98.74	\N	authorized	f	f
1f23779f-967a-48e0-87dc-1a7b6d04d926	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 17:20:47+08	exit	exit	96.47	\N	authorized	f	f
d2a46893-dec5-47f8-a241-385477bf2a96	7d49571b-14a0-4bb3-8a1d-282202aaedbf	e1416527-c574-416c-b356-82b135560ac1	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 18:55:30+08	entry	entry	99.40	\N	authorized	f	f
2828437a-7cf7-4485-be1b-34ed5e4ff0f2	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 21:05:53+08	exit	exit	94.42	\N	authorized	f	f
8a4e8ad2-6fed-4372-b596-ebad5d4847a4	52ab3e71-94b0-4ea7-aefb-17163f5db09a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 22:40:30+08	entry	entry	95.35	\N	authorized	f	f
6e6514ab-a7f8-489d-a65b-537bbfe5db2e	87b85607-7767-4fc3-bd64-d06cd8c8120a	8badc210-0cd8-499f-8c8f-a499c5cec5b5	HEY 7578	15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	2026-05-15 23:40:12+08	exit	exit	96.86	\N	authorized	f	f
\.


--
-- TOC entry 5291 (class 0 OID 24442)
-- Dependencies: 230
-- Data for Name: gates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gates (id, name, location_description, status, created_at) FROM stdin;
8badc210-0cd8-499f-8c8f-a499c5cec5b5	Main Gate	Primary entrance/exit at the front of the campus	open	2026-05-19 00:01:53.352312+08
e1416527-c574-416c-b356-82b135560ac1	Back Gate	Secondary entrance/exit at the rear of the campus	open	2026-05-19 00:01:53.352312+08
\.


--
-- TOC entry 5300 (class 0 OID 24666)
-- Dependencies: 239
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, type, is_read, created_at) FROM stdin;
e13060f0-e69c-4d12-aec2-4fd0b9ee96a1	53a79521-aab3-4879-92fb-e7a89513c862	Vehicle Approved	Your vehicle has been approved for campus access.	SUCCESS	f	2026-05-19 00:02:06.753562+08
f5cb5ebf-54da-42d4-8cd8-b8d537fe932c	53a79521-aab3-4879-92fb-e7a89513c862	Registration Reminder	Your vehicle registration expires in 30 days.	WARNING	f	2026-05-19 00:02:06.753562+08
175f5125-f5ba-4ca3-8fc2-3300a59715ea	6cc09fd4-8398-45db-9c8f-3a213e0791b8	Vehicle Approved	Your vehicle has been approved for campus access.	SUCCESS	f	2026-05-19 00:02:06.753562+08
15b04e37-9634-4714-a669-620e9752abc7	6cc09fd4-8398-45db-9c8f-3a213e0791b8	Registration Reminder	Your vehicle registration expires in 30 days.	WARNING	f	2026-05-19 00:02:06.753562+08
138772b0-d405-494b-ab17-760329d82ff2	dc602523-3a11-489a-ad84-f5b5671b3751	Vehicle Approved	Your vehicle has been approved for campus access.	SUCCESS	f	2026-05-19 00:02:06.753562+08
1f1bdf0f-e8e7-411b-b993-509c4b5557f8	dc602523-3a11-489a-ad84-f5b5671b3751	Registration Reminder	Your vehicle registration expires in 30 days.	WARNING	f	2026-05-19 00:02:06.753562+08
fc52d4ae-cded-4bb7-89c9-9a76b54afd8b	f72c09c7-5436-47af-b699-5c701fefcd3f	Vehicle Approved	Your vehicle has been approved for campus access.	SUCCESS	f	2026-05-19 00:02:06.753562+08
dc41af4e-0d03-4ac2-9376-cbd65044cf09	f72c09c7-5436-47af-b699-5c701fefcd3f	Registration Reminder	Your vehicle registration expires in 30 days.	WARNING	f	2026-05-19 00:02:06.753562+08
bde7398b-ef02-45bd-a13d-815d04e8c64a	17d04f74-fcf9-4349-9a6d-3eab4b18c714	Vehicle Approved	Your vehicle has been approved for campus access.	SUCCESS	f	2026-05-19 00:02:06.753562+08
c8a87286-cd5d-4ce6-bc05-0d0645e48e20	17d04f74-fcf9-4349-9a6d-3eab4b18c714	Registration Reminder	Your vehicle registration expires in 30 days.	WARNING	f	2026-05-19 00:02:06.753562+08
\.


--
-- TOC entry 5286 (class 0 OID 24326)
-- Dependencies: 225
-- Data for Name: ocr_scans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ocr_scans (id, user_id, scan_type, front_image_url, back_image_url, extracted_data, confidence_score, is_verified, verified_by, scan_id, raw_text, created_at) FROM stdin;
\.


--
-- TOC entry 5294 (class 0 OID 24498)
-- Dependencies: 233
-- Data for Name: security_shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.security_shifts (id, user_id, badge_id, duty_status, assigned_post, shift_start, shift_end, is_active, created_at, updated_at) FROM stdin;
a59182f5-c1b9-4058-8ae5-1b38beaecae5	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	SEC-100	on_duty	Main Gate	06:00:00	14:00:00	t	2026-05-19 00:02:06.179501+08	2026-05-19 00:02:06.179501+08
c9158868-0f13-4f28-b56e-28b51d7d7a9e	b1ba346e-a0dd-478f-914e-e6029cd516b8	SEC-101	on_duty	Back Gate	14:00:00	22:00:00	t	2026-05-19 00:02:06.179501+08	2026-05-19 00:02:06.179501+08
1f1480d8-69be-4ad0-9ce9-c9633d75735c	ab4aa00a-98b6-4073-9a23-9f1eb788c356	SEC-102	on_duty	Roving	22:00:00	06:00:00	t	2026-05-19 00:02:06.179501+08	2026-05-19 00:02:06.179501+08
c233032c-0cfd-45b6-a3bc-53d98d3650b7	d6e99d42-a37e-446e-b954-7b0bd4b3cb2f	SEC-103	on_duty	Main Gate	06:00:00	14:00:00	t	2026-05-19 00:02:06.179501+08	2026-05-19 00:02:06.179501+08
\.


--
-- TOC entry 5302 (class 0 OID 24706)
-- Dependencies: 241
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (key, value, description, updated_at) FROM stdin;
system_name	"CampusSecure ANPR"	System name displayed across dashboards	2026-05-19 00:01:53.349332+08
institution_name	"Caraga State University"	Operating institution	2026-05-19 00:01:53.349332+08
timezone	"Asia/Manila"	System-wide timezone (UTC+8)	2026-05-19 00:01:53.349332+08
ocr_threshold	85	Minimum OCR confidence score for auto-approval	2026-05-19 00:01:53.349332+08
plate_read_precision	"medium"	ANPR accuracy level: low, medium, high	2026-05-19 00:01:53.349332+08
auto_logout_minutes	30	Session timeout in minutes of inactivity	2026-05-19 00:01:53.349332+08
log_retention_days	90	Days to retain entry/exit logs before purge	2026-05-19 00:01:53.349332+08
allow_guest_entry	false	Allow unregistered plates to enter campus	2026-05-19 00:01:53.349332+08
intrusion_alerts	true	Push alerts for unregistered vehicle detections	2026-05-19 00:01:53.349332+08
camera_offline_alerts	true	Notify admin when a camera node disconnects	2026-05-19 00:01:53.349332+08
nightly_analytics	false	Send daily traffic summary to administrators	2026-05-19 00:01:53.349332+08
save_plate_snapshots	true	Archive a photo of each detected plate	2026-05-19 00:01:53.349332+08
max_vehicles_student	2	Maximum vehicles per student account	2026-05-19 00:01:53.349332+08
max_vehicles_faculty	3	Maximum vehicles per faculty account	2026-05-19 00:01:53.349332+08
\.


--
-- TOC entry 5301 (class 0 OID 24687)
-- Dependencies: 240
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_logs (id, actor_id, action, category, details, ip_address, created_at) FROM stdin;
c97ef184-f1bc-478a-b0ca-3a9ecf2bb6c1	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.113	2026-05-11 17:02:06.234368+08
6f44136b-e1bd-422c-9b0c-2db890836097	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.22	2026-04-29 05:02:06.234368+08
ef63c56a-013e-466e-88fa-76e8744f61f7	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.65	2026-05-05 04:02:06.234368+08
ed544ccf-2154-4dfb-bac0-b9e84ec2fa58	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.235	2026-05-16 10:02:06.234368+08
ce15e375-fda6-448b-ae10-f9e32019cb41	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.251	2026-05-09 21:02:06.234368+08
8a419dd5-22f2-47b2-85e9-23a74511c083	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.147	2026-05-03 00:02:06.234368+08
11084d7d-a7bf-4d17-86c8-fb36e9a581eb	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.171	2026-05-14 07:02:06.234368+08
ee53be82-0018-46ec-b305-f967f3986919	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.19	2026-05-05 03:02:06.234368+08
3664caff-8d1c-4c03-b2ce-715202a9fd86	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.122	2026-04-30 15:02:06.234368+08
d04c2f21-d63e-4f18-9543-7976f026f11e	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.93	2026-04-27 17:02:06.234368+08
59e3c5da-789a-4645-9acb-d23f1147ea78	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.207	2026-05-06 23:02:06.234368+08
412e5522-917e-4851-a672-3229ab5f9924	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.159	2026-05-10 10:02:06.234368+08
059601b8-70b2-48fd-abe0-53b579ffbfcb	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.27	2026-05-16 16:02:06.234368+08
c88010df-186a-4376-8324-aaa6c87b65e8	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.30	2026-04-19 06:02:06.234368+08
0b3eb3c9-c2cd-4a52-ad6d-fca47d79a366	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.25	2026-05-18 01:02:06.234368+08
236a85db-0b02-42a0-a38f-d8062ed99432	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.41	2026-04-30 03:02:06.234368+08
02d60c4a-acf9-4adc-bf7e-115519971e20	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.67	2026-04-27 00:02:06.234368+08
c7ea0a70-fbbb-4be8-9658-19c31c618f82	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.210	2026-05-15 11:02:06.234368+08
5379dc23-b339-463a-9747-96dce62407d7	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.63	2026-04-27 17:02:06.234368+08
d18e6421-41a5-41aa-81e6-ac6ec88eb957	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.95	2026-05-13 23:02:06.234368+08
74eec5e2-e03b-473f-8691-903c9ebd829c	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.179	2026-05-15 08:02:06.234368+08
8b337164-f93e-4f5e-8885-d8f70ca6a7b5	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.127	2026-05-09 18:02:06.234368+08
2060bffc-a239-4d82-95af-28776c526911	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.109	2026-04-19 06:02:06.234368+08
280d0136-8cb8-446f-9672-243f9c4e0586	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.59	2026-05-12 18:02:06.234368+08
25056b7a-a1ee-44d5-a945-7030f9386ccb	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.31	2026-05-08 07:02:06.234368+08
8e8f85ae-d134-48fb-bdfc-69a1e5c94a08	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.181	2026-04-22 08:02:06.234368+08
bab75c16-7b43-4a99-a3b1-2903e3474fab	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.248	2026-04-26 17:02:06.234368+08
d81ad74e-e02e-4c18-9e28-701c8557a4d1	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.65	2026-05-13 14:02:06.234368+08
efad91f1-9147-489a-9e2c-f87ec07adc2d	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.184	2026-05-11 03:02:06.234368+08
911dc74a-a1d8-42fa-b619-df033a0f702c	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.85	2026-05-04 15:02:06.234368+08
79134187-fa36-4675-827a-741bc61ce99b	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.203	2026-04-27 21:02:06.234368+08
e325e469-6e6b-40ec-8921-fa93f842ded3	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.188	2026-05-13 22:02:06.234368+08
6b5cc8db-dbfc-40db-8fa0-18b5799c9a28	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.97	2026-04-29 21:02:06.234368+08
636e3813-f82e-4774-b6d5-06d235b5750a	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.130	2026-05-04 03:02:06.234368+08
3f8fe66a-deb5-4b06-beb9-7b1243f2c45e	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.107	2026-05-10 08:02:06.234368+08
23478e3f-350d-4334-8678-93fe752eca68	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.194	2026-05-01 06:02:06.234368+08
1f21acc7-2657-45d2-a719-824c7c396f14	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.183	2026-04-29 20:02:06.234368+08
dcee2f4b-ebc7-4430-af9d-9bb51c161831	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.84	2026-05-04 03:02:06.234368+08
00991843-b46b-4f91-b995-839ec48676cc	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.80	2026-04-23 18:02:06.234368+08
0291084c-ba7a-41e1-aa66-474dffc2e3c6	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.192	2026-05-16 16:02:06.234368+08
3c272f69-4e37-47c7-9441-eb4e75b4a994	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.47	2026-05-04 18:02:06.234368+08
55927daa-7ebb-427f-896c-ab3a3662f9a6	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.153	2026-04-29 13:02:06.234368+08
bef30943-00bb-4364-aec6-46676466cf3e	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.227	2026-05-04 13:02:06.234368+08
f258a454-95f2-4f31-af49-2d54eec2c907	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.243	2026-05-01 15:02:06.234368+08
9abef7f4-6f00-4c6f-9ff3-567f110896d3	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.42	2026-05-10 14:02:06.234368+08
0d78df14-fa19-4038-9edb-88e01db78f57	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.199	2026-05-01 15:02:06.234368+08
39b60653-38ae-43a9-b855-59c6335dc49c	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.83	2026-05-12 04:02:06.234368+08
e7899cd6-a281-4910-8544-bb4124f4ce07	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.98	2026-05-01 09:02:06.234368+08
c4bdea91-eacd-4c6d-8114-871a4e35ac61	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.94	2026-05-12 14:02:06.234368+08
02a6e637-9e22-49a3-8f7d-04c0bce9ea6f	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.75	2026-05-04 07:02:06.234368+08
d5298960-5b95-47d3-925c-30b21c4a94a0	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.252	2026-05-15 12:02:06.234368+08
5ba15ba3-516e-42dc-b30a-1493d08d4959	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.21	2026-05-04 20:02:06.234368+08
e8117d7c-b3b2-4d32-8431-9b531e53f068	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.238	2026-05-04 03:02:06.234368+08
d33aeda6-e65c-4168-9372-8c81e5ac63c2	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.209	2026-05-09 20:02:06.234368+08
21552fe6-b539-4492-b0e9-ddf992258582	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.92	2026-05-08 13:02:06.234368+08
c846bc3b-183b-424b-916e-18d0a4abdc08	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.61	2026-04-26 08:02:06.234368+08
936aa30f-7e84-4626-966e-844f7085cbe8	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.86	2026-04-28 11:02:06.234368+08
96f621b7-0e19-4868-84f6-07c6c9c929f5	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.75	2026-05-17 04:02:06.234368+08
a01b4dfb-0f66-41b3-91af-6056e1b6596a	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.244	2026-05-09 06:02:06.234368+08
52b8b408-0a3f-48dd-9c24-a5a7200fa7df	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.155	2026-05-05 19:02:06.234368+08
dd13aff9-e092-4065-9ae1-6aca20c807c5	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.233	2026-05-14 01:02:06.234368+08
586d2036-ac7a-4141-8849-7516d6c5aa1a	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.142	2026-05-01 03:02:06.234368+08
973b1b3b-2571-475d-bf58-1cefcdcb46fd	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.122	2026-04-24 12:02:06.234368+08
91499633-cf53-4874-b5f3-a361ade4dbcc	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.149	2026-05-08 03:02:06.234368+08
10d3e164-025e-47d8-a0cf-f68342721eba	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.24	2026-04-21 08:02:06.234368+08
b72a4988-ccc1-4993-a049-4f396e116ea9	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.74	2026-04-28 07:02:06.234368+08
11de8947-e575-4a90-bb99-acb5331d93a6	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.169	2026-05-14 07:02:06.234368+08
cc53edc8-1488-4afa-a2eb-3b5953fe5c69	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.47	2026-05-09 22:02:06.234368+08
17893647-bbea-4770-a030-2d1560d28ede	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.231	2026-04-26 11:02:06.234368+08
0aa6b1b1-505c-46dc-a53e-0a4472cc95d5	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.172	2026-04-23 19:02:06.234368+08
9ef12d82-ef7e-4f75-9541-dfeffab66968	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.243	2026-05-14 06:02:06.234368+08
52f78538-1229-44cb-a8fb-a110de146bf5	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.228	2026-05-05 06:02:06.234368+08
1e3c4ec0-92a5-43ca-b8b8-5fc0a3466108	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.55	2026-05-13 19:02:06.234368+08
14535792-f141-497f-a0d2-131c6a49328d	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.106	2026-05-11 04:02:06.234368+08
2e0143e0-a0bb-46ce-b4a6-5789d0479cf5	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.54	2026-04-28 14:02:06.234368+08
afad890c-3978-488d-8b79-cfcce18a923e	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.179	2026-05-07 19:02:06.234368+08
b2dc8cb5-4d85-4656-9914-b559d0e921df	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.168	2026-04-30 12:02:06.234368+08
67343553-0b25-4384-b0ff-2bc8aa30a3b5	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.228	2026-04-27 11:02:06.234368+08
0c100339-57bf-4999-abcf-a7185b8ca7a7	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.55	2026-05-11 02:02:06.234368+08
eb380f62-1235-4672-a6f3-11ac2547fe1c	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.50	2026-05-03 14:02:06.234368+08
07a58cfe-8795-4f47-bf16-abfadea93229	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.228	2026-05-18 21:02:06.234368+08
b3793839-ca99-4d7a-8d7a-3680e2599c10	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.128	2026-04-21 16:02:06.234368+08
06d1e801-1ec2-4f8f-81ce-6073c733259d	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.177	2026-05-10 02:02:06.234368+08
0fb70bcd-4b08-4f1c-80f4-4d2c45cb1b70	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.242	2026-04-21 01:02:06.234368+08
5da556cc-756f-40e7-b8d9-f244768b0f35	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.74	2026-05-12 02:02:06.234368+08
96907c2e-1f84-4cd1-8ecb-089a1c8a4a7b	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.44	2026-04-22 04:02:06.234368+08
3aa9ba70-0419-45aa-be91-2efc701ab95b	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.163	2026-04-19 07:02:06.234368+08
6b3937e4-de54-49fc-af7d-29011bd9d5f8	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.253	2026-05-01 03:02:06.234368+08
89ee2d56-5d38-40e5-b12c-fdda72a7bb03	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.164	2026-05-11 21:02:06.234368+08
9d55c91f-b2b7-41c6-9f86-0075d939be11	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.220	2026-05-13 01:02:06.234368+08
0de50285-564c-4bac-ab9f-17625e6f624c	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.148	2026-05-07 10:02:06.234368+08
1c565783-0c9d-45ae-a8ad-747c8630251b	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.98	2026-05-03 13:02:06.234368+08
0a0abd43-1bbf-4c05-844a-0b5f8e0a7d65	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.246	2026-05-02 15:02:06.234368+08
1cede60f-6ec2-4160-a79f-6314d6d6203b	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.131	2026-05-09 04:02:06.234368+08
6836316d-1292-4334-be20-db8efe4d2ca5	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.123	2026-04-25 19:02:06.234368+08
07ad01f3-d762-4cef-8146-d2314c691c83	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.206	2026-05-17 04:02:06.234368+08
b15ce430-884f-41f2-aaa9-f959b1d1747b	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.193	2026-04-26 06:02:06.234368+08
6e9464e1-8fd2-490c-b6df-8a81cc113a0d	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.10	2026-05-03 16:02:06.234368+08
f0dfd97c-70f4-46ec-866f-2afe6839849c	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.205	2026-05-04 08:02:06.234368+08
065d645c-d23f-4fd5-8293-9b57e0c96efb	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.207	2026-05-05 18:02:06.234368+08
8b9e17ee-3cd2-4a0f-a5c7-d43652a6e6a8	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.44	2026-04-18 02:02:06.234368+08
2cb8750b-d730-464d-a99a-6baaa6d72cdf	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.62	2026-04-26 22:02:06.234368+08
9bb85830-f86b-4cc3-bac6-3476f66b8ab8	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.75	2026-05-11 18:02:06.234368+08
53b2c5da-d46b-418c-a023-7cb356e09b70	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.20	2026-05-08 01:02:06.234368+08
a8d11a25-97f8-45de-8369-23c64d936cd8	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.164	2026-04-28 13:02:06.234368+08
ed2d7c6e-e5b3-4a6b-a2ec-74478996eea7	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.230	2026-05-05 06:02:06.234368+08
6999905d-f272-49d2-aa16-9cba8302f903	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.97	2026-05-01 17:02:06.234368+08
61d48eae-08c6-4cad-b8cc-83e3e31a95e7	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.32	2026-04-24 04:02:06.234368+08
83bb9a24-e94d-46e8-9f5f-725fb90ec678	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.166	2026-04-29 05:02:06.234368+08
50ee3dd8-45df-438a-8453-10288a70f876	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.161	2026-05-16 06:02:06.234368+08
b563cf33-7856-4dde-9279-e41dc17d4c45	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.39	2026-04-27 11:02:06.234368+08
ca2758c9-b773-4400-b823-3749a257027c	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.34	2026-05-04 18:02:06.234368+08
2869ffdc-671e-48e9-8b23-674d2f848b66	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.234	2026-04-20 08:02:06.234368+08
d197f600-acbd-4c95-9018-1c86e47950c4	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.226	2026-05-11 08:02:06.234368+08
9b8912f6-045a-45a0-8ef2-99514761e589	2e2cab70-2a92-4897-95cf-cb5e59244d9c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.174	2026-05-02 03:02:06.234368+08
a8386a4d-7112-48a4-ad50-669d6426944a	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.140	2026-05-18 01:02:06.234368+08
833c092b-9dfc-4d03-994d-e98122a2282f	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.205	2026-05-08 00:02:06.234368+08
8f213a38-5847-4dfd-a49b-c9949496a0ab	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.136	2026-05-16 07:02:06.234368+08
704a82fa-5892-4b3c-8dfa-ebe737c33221	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.38	2026-04-20 17:02:06.234368+08
817d7d8f-e65c-4c0d-ab88-f78785e2a3e5	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.66	2026-05-08 11:02:06.234368+08
968a1ba0-386b-47a5-9cbe-90e1133da5d0	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.38	2026-05-04 17:02:06.234368+08
f877790f-d623-4ebd-a644-84b790487f56	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.99	2026-05-16 14:02:06.234368+08
2c8873e1-ea6b-4a03-8229-4fdf5377dcd5	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.102	2026-05-06 10:02:06.234368+08
ff213833-1803-4034-89af-21c1fab78aab	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.235	2026-04-23 09:02:06.234368+08
19379ac8-6731-4134-9435-e505c5d26843	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.223	2026-05-02 23:02:06.234368+08
a8519c6f-0d0d-4423-aa90-1b2cef3c48c2	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.149	2026-04-27 07:02:06.234368+08
07223d03-d4ca-46aa-beba-a3d38595adcf	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.74	2026-05-14 16:02:06.234368+08
7aeb48a6-5e60-4846-b616-6c622e90f8ec	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.221	2026-04-29 16:02:06.234368+08
38016c18-61a8-4da6-9c95-4936f949db7f	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.163	2026-05-05 23:02:06.234368+08
d67a6abf-0cfe-4236-a64f-dbe30674b237	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.21	2026-04-21 13:02:06.234368+08
8125e639-63bd-403d-8f2e-4bd150031c79	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.30	2026-04-20 06:02:06.234368+08
8479b365-54a2-48fa-a1aa-dfe427e7de71	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.125	2026-04-23 01:02:06.234368+08
44923ac5-19d8-498f-bc2d-4bf60182d653	2e2cab70-2a92-4897-95cf-cb5e59244d9c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.69	2026-04-23 12:02:06.234368+08
2dc9d7d7-5396-4938-a702-85970eb3b3d8	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.232	2026-05-01 13:02:06.234368+08
f952e8d8-7a7d-4e2c-a8c1-2ac7240670a5	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.120	2026-04-29 01:02:06.234368+08
97897094-ceba-46a9-9284-4efda70f219a	2e2cab70-2a92-4897-95cf-cb5e59244d9c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.68	2026-05-14 15:02:06.234368+08
184642a4-ee54-47e9-a2b8-7a30fbe648d3	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.login	system	{"simulated": true, "description": "Login session started"}	192.168.1.152	2026-05-11 03:02:06.234368+08
526b1004-03c1-49e9-85a8-cb1e89ddb870	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.107	2026-04-26 19:02:06.234368+08
76929c3d-7f4d-4584-8e41-ccdaa404f29e	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.resolved	alert	{"simulated": true, "description": "Anomaly alert resolved by security"}	192.168.1.135	2026-05-07 09:02:06.234368+08
031850e0-8219-4a97-85cd-d08cf348305b	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.rejected	system	{"simulated": true, "description": "Vehicle registration rejected"}	192.168.1.73	2026-05-05 11:02:06.234368+08
60397492-b0ca-4a38-afb1-0801440fb31b	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.246	2026-04-20 11:02:06.234368+08
cec78256-7064-4bf7-8ab4-96f0aea610d0	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	alert.dismissed	alert	{"simulated": true, "description": "Minor mismatch alert dismissed"}	192.168.1.202	2026-05-05 08:02:06.234368+08
39f244e5-7a1f-49f3-a5fd-76e8d364786c	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.123	2026-04-23 16:02:06.234368+08
b0c29e91-d96d-47c4-aedc-5f57b9ca18b6	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.117	2026-05-12 04:02:06.234368+08
2584a0a7-cfb2-4005-9f92-519683af78cd	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.134	2026-04-30 23:02:06.234368+08
a22cf3dd-4fc5-4697-b8ae-a0fc53c55dbc	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.240	2026-04-29 20:02:06.234368+08
f4b75e4f-94ae-4f29-a1aa-caa8c316d544	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.114	2026-04-18 15:02:06.234368+08
4db08638-6166-48e5-bd84-8fc5d070265c	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	vehicle.approved	system	{"simulated": true, "description": "Vehicle registration approved"}	192.168.1.18	2026-05-11 11:02:06.234368+08
b4cf64d6-fa99-4e0e-bacc-3f1c3f7b7958	9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	user.created	system	{"simulated": true, "description": "New user account created"}	192.168.1.87	2026-05-02 02:02:06.234368+08
4e57c8b4-f6a4-4f1c-92f1-a277abe11a42	2e2cab70-2a92-4897-95cf-cb5e59244d9c	settings.updated	system	{"simulated": true, "description": "System security parameters updated"}	192.168.1.221	2026-04-20 13:02:06.234368+08
\.


--
-- TOC entry 5285 (class 0 OID 24293)
-- Dependencies: 224
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, username, password_hash, role, status, first_name, middle_name, last_name, sex, birth_date, nationality, phone_number, address, student_id, department, academic_program, year_level, section, faculty_id, "position", employment_type, staff_id, staff_department, job_title, employment_status, visitor_purpose, visitor_host, visitor_reason, visitor_valid_id, visitor_date, visitor_duration, entry_motive, drivers_license_no, license_expiry_date, registration_token, id_photo_path, orcr_photo_path, qr_code_path, profile_image_url, last_login_at, created_at, updated_at, deleted_at) FROM stdin;
9d2b375b-07be-42fb-a0f8-ad6a00a0e42c	security@example.com	security_user	$2b$12$qjRJvLxj5fQq1RX/pXbvuePTBo25uwkhhccotqvXM3Z1sXDVpVLf6	security	active	Security	\N	Officer	\N	\N	Filipino	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	792c9fc6-db9c-4e8e-b944-ef4b5e04b117	\N	\N	\N	\N	\N	2026-05-19 00:01:53.363327+08	2026-05-19 00:01:53.363327+08	\N
53a79521-aab3-4879-92fb-e7a89513c862	student@example.com	student_user	$2b$12$Xt.dh/Od3OnlOFdep5trw.sVctDR92IdEING0Z7QflgX7MzMHQYs.	student	active	Campus	\N	Student	\N	\N	Filipino	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4cc6ae9f-46ef-4f4a-991d-039e955d64a6	\N	\N	\N	\N	\N	2026-05-19 00:01:53.363327+08	2026-05-19 00:01:53.363327+08	\N
0bb60556-064d-4209-927a-04308fcf8533	faculty@example.com	faculty_user	$2b$12$/MzQrlnLN1Lse0TnRPFJYOeeRjUjxNVCSeAZhk2Fqg0AIW4pS1V9C	faculty	active	Campus	\N	Faculty	\N	\N	Filipino	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	38bceb32-bb71-44a2-ad7d-2371eb999566	\N	\N	\N	\N	\N	2026-05-19 00:01:53.363327+08	2026-05-19 00:01:53.363327+08	\N
63dbadf1-7cc0-4974-903a-42b85e09dd49	staff@example.com	staff_user	$2b$12$P54KHyzcd83WZBbEjv/TTuU0rAaDIlOnU7gBCfBWmT11k6WtTXor.	staff	active	Campus	\N	Staff	\N	\N	Filipino	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	35eed89c-f728-4703-9fd0-2773f200c38a	\N	\N	\N	\N	\N	2026-05-19 00:01:53.363327+08	2026-05-19 00:01:53.363327+08	\N
34fb20e1-018b-4492-8f30-4adb7b78ee17	visitor@example.com	visitor_user	$2b$12$kNzr4LSUeV5kpAkRWF5xnOzKFxoTHk8Xew6xkweyULNa9lMAIy5s.	visitor	active	Campus	\N	Visitor	\N	\N	Filipino	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	27b36a36-e808-4751-b6cf-49f580f2af60	\N	\N	\N	\N	\N	2026-05-19 00:01:53.363327+08	2026-05-19 00:01:53.363327+08	\N
b1ba346e-a0dd-478f-914e-e6029cd516b8	security2@example.com	security_2	$2b$12$HlRM0epuU6d/0wIg5W0z1.LF.HjS/VAX/EKfBiYefOomfpLNmZahu	security	active	Eduardo	\N	Reyes	Male	\N	Filipino	09175551001	\N	\N	\N	\N	\N	\N	\N	\N	\N	SEC-2024-101	Security Department	Security Officer	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	b12a073b-c538-451a-895a-a19dbfa88033	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
ab4aa00a-98b6-4073-9a23-9f1eb788c356	security3@example.com	security_3	$2b$12$OmQYPSDf2bE.AZbnwSXpQeRXDGXKkTRQWiCvTrH1voDRL/C2GJ9Im	security	active	Fernando	\N	Cruz	Male	\N	Filipino	09175551002	\N	\N	\N	\N	\N	\N	\N	\N	\N	SEC-2024-102	Security Department	Security Officer	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ae8ad6dc-f230-415b-9eb3-fd805ec49bb3	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
d6e99d42-a37e-446e-b954-7b0bd4b3cb2f	security4@example.com	security_4	$2b$12$XfOA8NilQPsewywW2TI5bOtFXdaZH24kGIUOX90dUQXbZ1bAjFIQy	security	active	Roberto	\N	Bautista	Male	\N	Filipino	09175551003	\N	\N	\N	\N	\N	\N	\N	\N	\N	SEC-2024-103	Security Department	Security Officer	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f7729d6a-1d40-435e-bec0-07ba18be4bb2	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
6cc09fd4-8398-45db-9c8f-3a213e0791b8	student2@example.com	student_2	$2b$12$S2WqoeHeChwiC.g7OzwWZ.18UYvG0Z2jrChAMfV.kTn3yJhevjHAG	student	active	Angela	\N	Reyes	Female	\N	Filipino	09184207743	\N	2024-1002	College of Arts & Sciences	BS Information Technology	3rd Year	Section B	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	24128c72-b9b8-44b1-8879-d57a9165061d	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
dc602523-3a11-489a-ad84-f5b5671b3751	student3@example.com	student_3	$2b$12$dd1/UIykRYcxr24PjMbAeOG9RLzAeI1/qBQtSIcaT1/0RDcWlPVNG	student	active	Miguel	\N	Cruz	Male	\N	Filipino	09184979154	\N	2024-1003	College of Education	BS Civil Engineering	1st Year	Section C	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	bb916c6c-5482-4406-a787-cbbcee2b940f	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
f72c09c7-5436-47af-b699-5c701fefcd3f	student4@example.com	student_4	$2b$12$22M/Rm0TU5k5DttVjjAyGuczNKgJYGi07b0vEtnhk2ReQGKpMcdHi	student	active	Jasmine	\N	Bautista	Female	\N	Filipino	09182002657	\N	2024-1004	College of Business Administration	BS Electrical Engineering	2nd Year	Section D	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8709620a-1135-4502-8a82-826522554292	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
17d04f74-fcf9-4349-9a6d-3eab4b18c714	student5@example.com	student_5	$2b$12$9jSUUUi7L.YLJrr8z2WpWOonqEkoMVEKqBle8dl7g0YmVxkGIzTVC	student	active	Andrei	\N	Del Rosario	Male	\N	Filipino	09186123770	\N	2024-1005	College of Computing & Information Sciences	BS Accountancy	2nd Year	Section A	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	c1aa2af9-d72c-4df4-b5d2-72505bb963b2	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
d655078f-bb30-4af8-8229-5c477fbb2c9a	student6@example.com	student_6	$2b$12$DI3JSsSPc298ZB6WkDEvXepHe0gyKrpkYMrKHU8fFU1F7q2XQNTNu	student	active	Alyssa	\N	Gonzales	Female	\N	Filipino	09185923693	\N	2024-1006	College of Engineering	BS Business Administration	3rd Year	Section B	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5d79c6ba-134b-4a74-80df-a804c2cc8556	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
565abe9e-c207-4696-8dbd-5b6f20eac3fd	student7@example.com	student_7	$2b$12$pvSgyhFmX1Nmg8.20j0Ku.IYQWbzSlMj4sdLAqIkDnK/lo8p1ohwS	student	active	James	\N	Villanueva	Male	\N	Filipino	09188458959	\N	2024-1007	College of Arts & Sciences	BS Education	1st Year	Section C	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	87934542-fafe-4344-96e7-9a6caf1cab19	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
23d67ee1-65a4-48a1-b38e-28ca6b1c64de	student8@example.com	student_8	$2b$12$B2AGmUZ7.5HuYqaqzjD6OuNnpuJjRcRAyxuLYugUjfeCZBcVUq2oW	student	active	Bianca	\N	Fernandez	Female	\N	Filipino	09183014335	\N	2024-1008	College of Education	BA Communication	4th Year	Section D	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	206e7a82-6be3-4d46-93be-debaef0ccebe	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
70044ea9-9eeb-4e38-a019-8794dbfb8128	student9@example.com	student_9	$2b$12$9Ssq2ej.7nhFyfvLAJDTpuKH01T/RAaV8WKgBA.BEJkkJpcYAQu1e	student	active	Kevin	\N	Garcia	Male	\N	Filipino	09183816714	\N	2024-1009	College of Business Administration	BS Computer Science	1st Year	Section A	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	eeb2b7fb-ad47-48a4-911c-f97eac74aaaf	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
c5c3592d-15f7-4921-8b85-f456ad5e73d6	student10@example.com	student_10	$2b$12$53Sp0it.DxzsO9J5UG5xAOT8IGJB6iqnk/vCksegzM5FQ/tSoNPoG	student	active	Danielle	\N	Mendoza	Female	\N	Filipino	09186820085	\N	2024-1010	College of Computing & Information Sciences	BS Information Technology	4th Year	Section B	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	bd2129ad-9223-44ab-b473-29a26fdbdd71	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
55d715da-dd07-4330-98d8-8f6523058906	student11@example.com	student_11	$2b$12$3/VH0xQhTaGTgHnsVKV52unDh7kpaMfEZ/9vp7Z/xnkvXADKCN6qy	student	active	Joshua	\N	Torres	Male	\N	Filipino	09183306161	\N	2024-1011	College of Engineering	BS Civil Engineering	1st Year	Section C	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2598e30e-9fe7-47e1-b88f-d8a9f395d681	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
0d8c1427-f517-4d58-939b-caa6a134eff6	student12@example.com	student_12	$2b$12$sAXn9pzq4SQY93Lr.61RF.u6XU.hdEQA4HUXi1sE1XJiE2Reavxtu	student	active	Isabelle	\N	Aquino	Female	\N	Filipino	09189238817	\N	2024-1012	College of Arts & Sciences	BS Electrical Engineering	1st Year	Section D	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	d7109255-0ad7-4ba4-929e-92e10116ea0c	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
1331be7e-7887-4c5d-ba13-9704680bd479	student13@example.com	student_13	$2b$12$..vh4z0XW708uoz5k24sq.e3LcH9FMnUbA0liRDnHJT5z4yAS84Nm	student	active	Benedict	\N	Ramos	Male	\N	Filipino	09184238495	\N	2024-1013	College of Education	BS Accountancy	4th Year	Section A	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	da9e9e95-6a60-4da1-85dd-6ef5cd4eb144	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
e13ea82f-2c39-4aa0-b469-4134df415537	student14@example.com	student_14	$2b$12$g3JboimgYEDdw8BCTYE/O.QQ8jyEk0NapxP84.aJ8g5B/tWY2JVhe	student	active	Hannah	\N	Rivera	Female	\N	Filipino	09187570831	\N	2024-1014	College of Business Administration	BS Business Administration	3rd Year	Section B	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4a4953ab-d36d-41fd-b9b8-5ccaa191881a	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
5ff9ca67-f6f3-4f53-bc18-988f0d954098	student15@example.com	student_15	$2b$12$BbtFn7aTTFN459hVWQUIU.KXVaDxsQw2NgUvgA81OWzJdcEUez.EW	student	active	Dominic	\N	Lopez	Male	\N	Filipino	09181137065	\N	2024-1015	College of Computing & Information Sciences	BS Education	3rd Year	Section C	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	fd5fbd8e-7afa-4745-a95c-84da6c7c0fa3	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
c47824b8-c7c4-46e7-b8a3-6c45c4448b43	faculty2@example.com	faculty_2	$2b$12$JcfJ/0SAWu8MiacAQRK2ce.Rd.uleax/lN6NDVeREhCQBdpSdzFZ2	faculty	active	Prof. Antonio	\N	Torres	Male	\N	Filipino	09195256235	\N	\N	College of Arts & Sciences	\N	\N	\N	FAC-2024-201	Instructor	Regular	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	012a1762-ae0a-4a91-91ca-267606d1efa1	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
1e001c3c-78dd-40b6-b6a8-092336ec80f1	faculty3@example.com	faculty_3	$2b$12$invWxF0gE4qiFSIxBNVipuXoaCqp8flre7/88.sytcg.WjUWs6DPW	faculty	active	Dr. Carmen	\N	Aquino	Female	\N	Filipino	09191163337	\N	\N	College of Education	\N	\N	\N	FAC-2024-202	Professor	Regular	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0386e9c5-9b8b-40d2-a818-8998f6f68e05	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
19596834-d663-40ed-a73e-fcb8635ffce3	faculty4@example.com	faculty_4	$2b$12$mG76FHZDlYs8bWKkAwTcdusVDIe2pqFLd5lhbfhX3BwSYHp/vW0fO	faculty	active	Prof. Manuel	\N	Ramos	Male	\N	Filipino	09195468500	\N	\N	College of Business Administration	\N	\N	\N	FAC-2024-203	Associate Professor	Regular	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4f7e0f53-2dd1-47d5-a13e-507fd954e37b	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
307cf0e4-0aa7-4981-9ee2-4f42d54709a7	faculty5@example.com	faculty_5	$2b$12$WgcXBT/FcfetLitnq1DWHOTpsfL72NOU92N7Zci15QTdEnDJ8SGOi	faculty	active	Dr. Lucia	\N	Rivera	Female	\N	Filipino	09196893491	\N	\N	College of Computing & Information Sciences	\N	\N	\N	FAC-2024-204	Associate Professor	Regular	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	45e0dc09-07b1-4b78-b0d7-a584933efb3c	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
2e2cab70-2a92-4897-95cf-cb5e59244d9c	admin@example.com	admin_user	$2b$12$76g/j6y6OukPEsicwZ113e3o.StqrTAc4tGdP8ZpVMEU/AsjpEe1O	admin	active	System	\N	Admin	\N	\N	Filipino	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	45f62fcb-83d4-497f-9e5f-f9f0e5c24951	\N	\N	\N	\N	2026-05-19 00:02:50.712086+08	2026-05-19 00:01:53.363327+08	2026-05-19 00:02:50.158512+08	\N
c9a0fda4-df87-4981-9343-e96d28bc54f1	staff2@example.com	staff_2	$2b$12$.iy1Exd8wSFATE96zJhEOegpq1DrU5b5axHywB4gvwBXoubCDtgwi	staff	active	Ernesto	\N	Castillo	Male	\N	Filipino	09204561334	\N	\N	\N	\N	\N	\N	\N	\N	\N	STF-2024-301	Registrar	Administrative Officer	Active	\N	\N	\N	\N	\N	\N	\N	\N	\N	a676166b-c636-4fa8-b587-f346ac614b16	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
0e59db40-d03c-4c48-a03e-4223f08654a9	staff3@example.com	staff_3	$2b$12$QldBCHODI9Izbl2WGE20SudvXZI4wMcgc9x0cmke40zGo6Z5VSHHK	staff	active	Maricel	\N	Navarro	Female	\N	Filipino	09208456749	\N	\N	\N	\N	\N	\N	\N	\N	\N	STF-2024-302	Finance Office	Coordinator	Active	\N	\N	\N	\N	\N	\N	\N	\N	\N	0dc0ecff-a790-4b3d-8e13-6d45d571c930	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
9e876a8e-0814-46af-ac9e-edd9c9fd5c7e	visitor2@example.com	visitor_2	$2b$12$sqvusr7.Y0TYX4Er/0KlquIPU3vapduYImYkpkQ2lADXVdyEIin/a	visitor	active	Lourdes	\N	Domingo	Female	\N	Filipino	09215185954	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Meeting	\N	\N	\N	\N	\N	\N	\N	\N	c6afd7d0-8b92-43cb-89b0-3d9748f88d61	\N	\N	\N	\N	\N	2026-05-19 00:01:53.880603+08	\N	\N
\.


--
-- TOC entry 5287 (class 0 OID 24348)
-- Dependencies: 226
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, user_id, plate_number, type, brand, color, other_vehicle_type, anpr_flagged, anpr_flag_msg, status, registration_date, expiry_date, approved_by, approved_at, is_on_campus, last_seen_gate, last_seen_at, created_at, updated_at, deleted_at, orcr_photo_path) FROM stdin;
006968db-3f98-4914-9190-aebc0e16b038	53a79521-aab3-4879-92fb-e7a89513c862	ITR 6180	car	Ford	Yellow	\N	f	\N	approved	2026-04-19 00:02:05.507566+08	2027-04-19 00:02:05.507566+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2026-04-20 00:02:05.507566+08	t	Back Gate	2026-05-18 23:40:05.507605+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
80012044-99f3-4d56-b0b3-ce9eca6d6d3f	6cc09fd4-8398-45db-9c8f-3a213e0791b8	POX 9908	motorcycle	Kawasaki	White	\N	f	\N	approved	2025-12-14 00:02:05.507849+08	2026-12-14 00:02:05.507849+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-12-15 00:02:05.507849+08	t	Back Gate	2026-05-18 23:24:05.507873+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
15798a74-062e-473f-a3d0-86873fdfe969	dc602523-3a11-489a-ad84-f5b5671b3751	HEY 7578	motorcycle	Honda	White	\N	f	\N	approved	2025-09-14 00:02:05.508015+08	2026-09-14 00:02:05.508015+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-09-15 00:02:05.508015+08	f	Back Gate	2026-05-18 23:33:05.508034+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
f5357d55-f8b1-4ea1-8a28-3454f8b330f9	f72c09c7-5436-47af-b699-5c701fefcd3f	NQR 4972	car	Ford	Gray	\N	f	\N	approved	2025-09-12 00:02:05.508168+08	2026-09-12 00:02:05.508168+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-09-13 00:02:05.508168+08	f	Back Gate	2026-05-18 22:28:05.508192+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
6d1a4c45-0729-481f-ba82-0944686d08c0	17d04f74-fcf9-4349-9a6d-3eab4b18c714	JNG 7377	motorcycle	TVS	Yellow	\N	f	\N	approved	2026-03-13 00:02:05.50836+08	2027-03-13 00:02:05.50836+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2026-03-14 00:02:05.50836+08	f	Back Gate	2026-05-18 23:15:05.508383+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
ea11064a-84fe-4683-b56c-793a0725d04e	d655078f-bb30-4af8-8229-5c477fbb2c9a	EAR 8304	motorcycle	Yamaha	Maroon	\N	f	\N	approved	2026-03-08 00:02:05.508523+08	2027-03-08 00:02:05.508523+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2026-03-09 00:02:05.508523+08	t	Main Gate	2026-05-18 23:47:05.508542+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
f82a8014-d7cc-4f28-a38d-43013fec9b5d	565abe9e-c207-4696-8dbd-5b6f20eac3fd	XEA 5924	car	Hyundai	Gray	\N	f	\N	approved	2025-08-07 00:02:05.508681+08	2026-08-07 00:02:05.508681+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-08-08 00:02:05.508681+08	f	Back Gate	2026-05-18 23:07:05.508702+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
cbbc8c32-cf60-4187-b51a-48f744401876	23d67ee1-65a4-48a1-b38e-28ca6b1c64de	IRI 6514	motorcycle	Yamaha	Gray	\N	f	\N	approved	2025-11-05 00:02:05.508838+08	2026-11-05 00:02:05.508838+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-11-06 00:02:05.508838+08	t	Main Gate	2026-05-18 23:47:05.508857+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
862bf908-18dd-40cb-b201-12578c4224b2	70044ea9-9eeb-4e38-a019-8794dbfb8128	TTF 9672	motorcycle	Kawasaki	Black	\N	f	\N	approved	2026-01-13 00:02:05.508991+08	2027-01-13 00:02:05.508991+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2026-01-14 00:02:05.508991+08	t	Main Gate	2026-05-18 22:25:05.50901+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
32771628-1901-4d7c-a22a-05558df4af53	c5c3592d-15f7-4921-8b85-f456ad5e73d6	CHN 2826	car	Hyundai	Yellow	\N	f	\N	approved	2025-08-08 00:02:05.509158+08	2026-08-08 00:02:05.509158+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-08-09 00:02:05.509158+08	f	Main Gate	2026-05-18 23:07:05.509175+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
743275bd-7c24-4374-8c72-f9b34ab9ea67	55d715da-dd07-4330-98d8-8f6523058906	VEO 9827	motorcycle	Yamaha	Gray	\N	f	\N	pending	2025-09-24 00:02:05.509304+08	\N	\N	\N	f	\N	\N	2026-05-19 00:02:05.495594+08	\N	\N	\N
c6124e5e-0411-42f4-b897-55cdc1dba91a	0d8c1427-f517-4d58-939b-caa6a134eff6	HUC 6437	motorcycle	Suzuki	Silver	\N	f	\N	pending	2025-12-27 00:02:05.509437+08	\N	\N	\N	f	\N	\N	2026-05-19 00:02:05.495594+08	\N	\N	\N
95725082-b32a-4d7a-b90d-17f1dedcd1a7	1331be7e-7887-4c5d-ba13-9704680bd479	BJM 4791	car	Suzuki	Silver	\N	f	\N	pending	2026-03-16 00:02:05.509566+08	\N	\N	\N	f	\N	\N	2026-05-19 00:02:05.495594+08	\N	\N	\N
39bf0ce6-8e88-49c2-b708-257631acf968	e13ea82f-2c39-4aa0-b469-4134df415537	RKY 5821	motorcycle	TVS	Maroon	\N	f	\N	expired	2026-03-13 00:02:05.509695+08	\N	\N	\N	f	\N	\N	2026-05-19 00:02:05.495594+08	\N	\N	\N
6b82bd9b-e1d6-4ac3-a64c-1f1cea9a7d9a	5ff9ca67-f6f3-4f53-bc18-988f0d954098	DHI 6719	motorcycle	Yamaha	Silver	\N	f	\N	expired	2025-12-01 00:02:05.509826+08	\N	\N	\N	f	\N	\N	2026-05-19 00:02:05.495594+08	\N	\N	\N
2fc39a48-1549-4040-87f4-700a03dd4f27	0bb60556-064d-4209-927a-04308fcf8533	UAA 4380	car	Suzuki	White	\N	f	\N	approved	2025-12-02 00:02:05.509956+08	2026-09-08 00:02:05.509963+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-12-23 00:02:05.509969+08	f	Main Gate	2026-05-18 23:32:05.509975+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
18d9944b-766c-49c9-b473-ea7d8d3f0e62	c47824b8-c7c4-46e7-b8a3-6c45c4448b43	XHU 1505	car	Nissan	Yellow	\N	f	\N	approved	2025-11-24 00:02:05.510121+08	2026-12-14 00:02:05.510128+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2026-02-14 00:02:05.510134+08	f	Main Gate	2026-05-18 23:57:05.510142+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
00d0e9c7-da56-44fc-b7d9-d37e56bb2255	1e001c3c-78dd-40b6-b6a8-092336ec80f1	MXA 7486	car	Nissan	Blue	\N	f	\N	approved	2025-11-30 00:02:05.510272+08	2026-09-19 00:02:05.510277+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-11-12 00:02:05.510282+08	t	Main Gate	2026-05-18 23:27:05.510289+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
5e196d9e-fb51-4c1b-84d7-8282dcd8bb67	19596834-d663-40ed-a73e-fcb8635ffce3	SOG 7886	car	Suzuki	Gray	\N	f	\N	approved	2025-12-27 00:02:05.51044+08	2026-11-04 00:02:05.510447+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-11-30 00:02:05.510452+08	t	Main Gate	2026-05-18 23:07:05.510459+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
840b5f1d-892b-41f1-86c9-6b76d78f574b	307cf0e4-0aa7-4981-9ee2-4f42d54709a7	JIG 1791	car	Kia	Yellow	\N	f	\N	approved	2026-01-01 00:02:05.510597+08	2027-01-08 00:02:05.510603+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2025-12-07 00:02:05.510609+08	t	Main Gate	2026-05-18 23:43:05.510615+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
f5974a1a-3c2c-4ed2-a7c3-c809e7ca4048	63dbadf1-7cc0-4974-903a-42b85e09dd49	RPM 6768	van	Suzuki	Blue	\N	f	\N	approved	2026-02-08 00:02:05.510755+08	2026-12-07 00:02:05.510761+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2026-03-25 00:02:05.510767+08	t	Main Gate	2026-05-18 23:52:05.51077+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
0e8e2286-86d3-4efa-8974-dae3ff0d6d45	c9a0fda4-df87-4981-9343-e96d28bc54f1	UCX 8013	van	Nissan	Blue	\N	f	\N	approved	2025-12-17 00:02:05.510907+08	2026-12-06 00:02:05.510915+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2026-03-25 00:02:05.510921+08	t	Main Gate	2026-05-18 23:52:05.510925+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
dd077ef7-d172-4a7a-b033-4a1b964032ff	0e59db40-d03c-4c48-a03e-4223f08654a9	RCF 4361	van	Kia	Maroon	\N	f	\N	approved	2026-01-12 00:02:05.511066+08	2026-10-28 00:02:05.511072+08	2e2cab70-2a92-4897-95cf-cb5e59244d9c	2026-03-25 00:02:05.511077+08	t	Main Gate	2026-05-18 23:52:05.51108+08	2026-05-19 00:02:05.495594+08	\N	\N	\N
6058db76-7960-4bd3-a712-9f1d2bafad6b	53a79521-aab3-4879-92fb-e7a89513c862	XCX 3876	car	Unknown	Black	\N	t	Repeated unauthorized access attempts	blacklisted	2026-02-18 00:02:05.511207+08	\N	\N	\N	f	\N	\N	2026-05-19 00:02:05.495594+08	\N	\N	\N
\.


--
-- TOC entry 5299 (class 0 OID 24638)
-- Dependencies: 238
-- Data for Name: violations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.violations (id, entry_log_id, vehicle_id, type, description, fine_amount, status, resolved_by, resolved_at, created_at) FROM stdin;
\.


--
-- TOC entry 5290 (class 0 OID 24427)
-- Dependencies: 229
-- Data for Name: visitor_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitor_vehicles (id, visitor_id, plate_number, type, brand, color, created_at) FROM stdin;
\.


--
-- TOC entry 5289 (class 0 OID 24405)
-- Dependencies: 228
-- Data for Name: visitors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitors (id, full_name, phone_number, purpose_of_visit, host_user_id, id_type, id_number, check_in_at, check_out_at, gate_id, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 221
-- Name: anpr_camera_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.anpr_camera_config_id_seq', 16, true);


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 223
-- Name: detected_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detected_vehicles_id_seq', 1, false);


--
-- TOC entry 5089 (class 2606 OID 24630)
-- Name: anpr_anomaly_events anpr_anomaly_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_anomaly_events
    ADD CONSTRAINT anpr_anomaly_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5025 (class 2606 OID 20639)
-- Name: anpr_camera_config anpr_camera_config_camera_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_camera_config
    ADD CONSTRAINT anpr_camera_config_camera_id_key UNIQUE (camera_id);


--
-- TOC entry 5027 (class 2606 OID 20641)
-- Name: anpr_camera_config anpr_camera_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_camera_config
    ADD CONSTRAINT anpr_camera_config_pkey PRIMARY KEY (id);


--
-- TOC entry 5085 (class 2606 OID 24589)
-- Name: anpr_plate_captures anpr_plate_captures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_plate_captures
    ADD CONSTRAINT anpr_plate_captures_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 24394)
-- Name: blacklist_records blacklist_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklist_records
    ADD CONSTRAINT blacklist_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5070 (class 2606 OID 24492)
-- Name: camera_settings camera_settings_camera_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_settings
    ADD CONSTRAINT camera_settings_camera_id_key UNIQUE (camera_id);


--
-- TOC entry 5072 (class 2606 OID 24490)
-- Name: camera_settings camera_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_settings
    ADD CONSTRAINT camera_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5068 (class 2606 OID 24473)
-- Name: cameras cameras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 20653)
-- Name: detected_vehicles detected_vehicles_detection_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detected_vehicles
    ADD CONSTRAINT detected_vehicles_detection_id_key UNIQUE (detection_id);


--
-- TOC entry 5033 (class 2606 OID 20655)
-- Name: detected_vehicles detected_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detected_vehicles
    ADD CONSTRAINT detected_vehicles_pkey PRIMARY KEY (id);


--
-- TOC entry 5076 (class 2606 OID 24526)
-- Name: duty_logs duty_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.duty_logs
    ADD CONSTRAINT duty_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 24552)
-- Name: entry_logs entry_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_logs
    ADD CONSTRAINT entry_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5066 (class 2606 OID 24453)
-- Name: gates gates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gates
    ADD CONSTRAINT gates_pkey PRIMARY KEY (id);


--
-- TOC entry 5097 (class 2606 OID 24679)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5051 (class 2606 OID 24337)
-- Name: ocr_scans ocr_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ocr_scans
    ADD CONSTRAINT ocr_scans_pkey PRIMARY KEY (id);


--
-- TOC entry 5074 (class 2606 OID 24510)
-- Name: security_shifts security_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_shifts
    ADD CONSTRAINT security_shifts_pkey PRIMARY KEY (id);


--
-- TOC entry 5103 (class 2606 OID 24715)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- TOC entry 5101 (class 2606 OID 24698)
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 24317)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5045 (class 2606 OID 24315)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 24321)
-- Name: users users_registration_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_registration_token_key UNIQUE (registration_token);


--
-- TOC entry 5049 (class 2606 OID 24319)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5056 (class 2606 OID 24366)
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- TOC entry 5058 (class 2606 OID 24368)
-- Name: vehicles vehicles_plate_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_plate_number_key UNIQUE (plate_number);


--
-- TOC entry 5093 (class 2606 OID 24650)
-- Name: violations violations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_pkey PRIMARY KEY (id);


--
-- TOC entry 5064 (class 2606 OID 24436)
-- Name: visitor_vehicles visitor_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_vehicles
    ADD CONSTRAINT visitor_vehicles_pkey PRIMARY KEY (id);


--
-- TOC entry 5062 (class 2606 OID 24416)
-- Name: visitors visitors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_pkey PRIMARY KEY (id);


--
-- TOC entry 5090 (class 1259 OID 24636)
-- Name: idx_anpr_anomalies_capture; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_anpr_anomalies_capture ON public.anpr_anomaly_events USING btree (capture_id);


--
-- TOC entry 5091 (class 1259 OID 24637)
-- Name: idx_anpr_anomalies_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_anpr_anomalies_status ON public.anpr_anomaly_events USING btree (status);


--
-- TOC entry 5028 (class 1259 OID 20692)
-- Name: idx_anpr_cam_camera_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_anpr_cam_camera_id ON public.anpr_camera_config USING btree (camera_id);


--
-- TOC entry 5029 (class 1259 OID 20693)
-- Name: idx_anpr_cam_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_anpr_cam_is_active ON public.anpr_camera_config USING btree (is_active);


--
-- TOC entry 5086 (class 1259 OID 24616)
-- Name: idx_anpr_captures_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_anpr_captures_created ON public.anpr_plate_captures USING btree (created_at);


--
-- TOC entry 5087 (class 1259 OID 24615)
-- Name: idx_anpr_captures_plate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_anpr_captures_plate ON public.anpr_plate_captures USING btree (plate_normalized);


--
-- TOC entry 5034 (class 1259 OID 20696)
-- Name: idx_det_camera_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_det_camera_id ON public.detected_vehicles USING btree (camera_id);


--
-- TOC entry 5035 (class 1259 OID 20697)
-- Name: idx_det_detection_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_det_detection_id ON public.detected_vehicles USING btree (detection_id);


--
-- TOC entry 5036 (class 1259 OID 20698)
-- Name: idx_det_frame_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_det_frame_timestamp ON public.detected_vehicles USING btree (frame_timestamp);


--
-- TOC entry 5037 (class 1259 OID 20699)
-- Name: idx_det_plate_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_det_plate_number ON public.detected_vehicles USING btree (plate_number);


--
-- TOC entry 5079 (class 1259 OID 24575)
-- Name: idx_logs_direction; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_direction ON public.entry_logs USING btree (direction);


--
-- TOC entry 5080 (class 1259 OID 24576)
-- Name: idx_logs_gate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_gate ON public.entry_logs USING btree (gate_id);


--
-- TOC entry 5081 (class 1259 OID 24574)
-- Name: idx_logs_plate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_plate ON public.entry_logs USING btree (detected_plate_number);


--
-- TOC entry 5082 (class 1259 OID 24573)
-- Name: idx_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_timestamp ON public.entry_logs USING btree ("timestamp");


--
-- TOC entry 5083 (class 1259 OID 24577)
-- Name: idx_logs_vehicle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_vehicle ON public.entry_logs USING btree (vehicle_id);


--
-- TOC entry 5094 (class 1259 OID 24686)
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);


--
-- TOC entry 5095 (class 1259 OID 24685)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- TOC entry 5098 (class 1259 OID 24705)
-- Name: idx_system_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_action ON public.system_logs USING btree (action);


--
-- TOC entry 5099 (class 1259 OID 24704)
-- Name: idx_system_logs_actor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_actor ON public.system_logs USING btree (actor_id);


--
-- TOC entry 5038 (class 1259 OID 24322)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5039 (class 1259 OID 24323)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 5040 (class 1259 OID 24324)
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- TOC entry 5041 (class 1259 OID 24325)
-- Name: idx_users_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_student_id ON public.users USING btree (student_id);


--
-- TOC entry 5052 (class 1259 OID 24379)
-- Name: idx_vehicles_plate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicles_plate ON public.vehicles USING btree (plate_number);


--
-- TOC entry 5053 (class 1259 OID 24381)
-- Name: idx_vehicles_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicles_status ON public.vehicles USING btree (status);


--
-- TOC entry 5054 (class 1259 OID 24380)
-- Name: idx_vehicles_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicles_user ON public.vehicles USING btree (user_id);


--
-- TOC entry 5128 (class 2606 OID 24631)
-- Name: anpr_anomaly_events anpr_anomaly_events_capture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_anomaly_events
    ADD CONSTRAINT anpr_anomaly_events_capture_id_fkey FOREIGN KEY (capture_id) REFERENCES public.anpr_plate_captures(id) ON DELETE CASCADE;


--
-- TOC entry 5123 (class 2606 OID 24590)
-- Name: anpr_plate_captures anpr_plate_captures_camera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_plate_captures
    ADD CONSTRAINT anpr_plate_captures_camera_id_fkey FOREIGN KEY (camera_id) REFERENCES public.cameras(id) ON DELETE SET NULL;


--
-- TOC entry 5124 (class 2606 OID 24610)
-- Name: anpr_plate_captures anpr_plate_captures_entry_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_plate_captures
    ADD CONSTRAINT anpr_plate_captures_entry_log_id_fkey FOREIGN KEY (entry_log_id) REFERENCES public.entry_logs(id) ON DELETE SET NULL;


--
-- TOC entry 5125 (class 2606 OID 24595)
-- Name: anpr_plate_captures anpr_plate_captures_gate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_plate_captures
    ADD CONSTRAINT anpr_plate_captures_gate_id_fkey FOREIGN KEY (gate_id) REFERENCES public.gates(id) ON DELETE SET NULL;


--
-- TOC entry 5126 (class 2606 OID 24605)
-- Name: anpr_plate_captures anpr_plate_captures_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_plate_captures
    ADD CONSTRAINT anpr_plate_captures_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5127 (class 2606 OID 24600)
-- Name: anpr_plate_captures anpr_plate_captures_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anpr_plate_captures
    ADD CONSTRAINT anpr_plate_captures_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;


--
-- TOC entry 5108 (class 2606 OID 24400)
-- Name: blacklist_records blacklist_records_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklist_records
    ADD CONSTRAINT blacklist_records_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(id);


--
-- TOC entry 5109 (class 2606 OID 24395)
-- Name: blacklist_records blacklist_records_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklist_records
    ADD CONSTRAINT blacklist_records_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;


--
-- TOC entry 5115 (class 2606 OID 24493)
-- Name: camera_settings camera_settings_camera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camera_settings
    ADD CONSTRAINT camera_settings_camera_id_fkey FOREIGN KEY (camera_id) REFERENCES public.cameras(id) ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 24474)
-- Name: cameras cameras_gate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_gate_id_fkey FOREIGN KEY (gate_id) REFERENCES public.gates(id) ON DELETE SET NULL;


--
-- TOC entry 5117 (class 2606 OID 24527)
-- Name: duty_logs duty_logs_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.duty_logs
    ADD CONSTRAINT duty_logs_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.security_shifts(id) ON DELETE CASCADE;


--
-- TOC entry 5118 (class 2606 OID 24532)
-- Name: duty_logs duty_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.duty_logs
    ADD CONSTRAINT duty_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 24553)
-- Name: entry_logs entry_logs_camera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_logs
    ADD CONSTRAINT entry_logs_camera_id_fkey FOREIGN KEY (camera_id) REFERENCES public.cameras(id);


--
-- TOC entry 5120 (class 2606 OID 24558)
-- Name: entry_logs entry_logs_gate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_logs
    ADD CONSTRAINT entry_logs_gate_id_fkey FOREIGN KEY (gate_id) REFERENCES public.gates(id);


--
-- TOC entry 5121 (class 2606 OID 24568)
-- Name: entry_logs entry_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_logs
    ADD CONSTRAINT entry_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5122 (class 2606 OID 24563)
-- Name: entry_logs entry_logs_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entry_logs
    ADD CONSTRAINT entry_logs_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;


--
-- TOC entry 5110 (class 2606 OID 24454)
-- Name: visitors fk_visitors_gate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT fk_visitors_gate FOREIGN KEY (gate_id) REFERENCES public.gates(id);


--
-- TOC entry 5132 (class 2606 OID 24680)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5104 (class 2606 OID 24338)
-- Name: ocr_scans ocr_scans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ocr_scans
    ADD CONSTRAINT ocr_scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5105 (class 2606 OID 24343)
-- Name: ocr_scans ocr_scans_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ocr_scans
    ADD CONSTRAINT ocr_scans_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- TOC entry 5116 (class 2606 OID 24511)
-- Name: security_shifts security_shifts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_shifts
    ADD CONSTRAINT security_shifts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5133 (class 2606 OID 24699)
-- Name: system_logs system_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5106 (class 2606 OID 24374)
-- Name: vehicles vehicles_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 5107 (class 2606 OID 24369)
-- Name: vehicles vehicles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5129 (class 2606 OID 24651)
-- Name: violations violations_entry_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_entry_log_id_fkey FOREIGN KEY (entry_log_id) REFERENCES public.entry_logs(id) ON DELETE CASCADE;


--
-- TOC entry 5130 (class 2606 OID 24661)
-- Name: violations violations_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- TOC entry 5131 (class 2606 OID 24656)
-- Name: violations violations_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violations
    ADD CONSTRAINT violations_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;


--
-- TOC entry 5113 (class 2606 OID 24437)
-- Name: visitor_vehicles visitor_vehicles_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitor_vehicles
    ADD CONSTRAINT visitor_vehicles_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.visitors(id) ON DELETE CASCADE;


--
-- TOC entry 5111 (class 2606 OID 24422)
-- Name: visitors visitors_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5112 (class 2606 OID 24417)
-- Name: visitors visitors_host_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_host_user_id_fkey FOREIGN KEY (host_user_id) REFERENCES public.users(id);


-- Completed on 2026-05-19 05:53:05

--
-- PostgreSQL database dump complete
--

\unrestrict ILw9QqXY6yHLlCVXfNvjR3Zmpg595eaRCx3Ii23fLG2cVVONd90xgMNPOx9SBJz

