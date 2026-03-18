"""
Tesseract LSTM Training Utility
Automates the fine-tuning of Tesseract for Philippine ID recognition.

Usage:
    python train_tesseract.py --check        Check if training tools are available
    python train_tesseract.py --prepare      Generate .lstmf files from .tif/.box pairs
    python train_tesseract.py --extract      Extract base LSTM model from eng.traineddata
    python train_tesseract.py --train        Run the LSTM fine-tuning
    python train_tesseract.py --finalize     Combine checkpoint into final .traineddata
    python train_tesseract.py --eval         Evaluate current OCR accuracy against ground truth
    python train_tesseract.py --all          Run full pipeline (prepare → extract → train → finalize)
"""
import os
import subprocess
import glob
import argparse
import sys

# Fix Windows console encoding for Unicode characters
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')


# Configuration — auto-detect Tesseract install location
TESSERACT_CANDIDATES = [
    r"C:\Users\COMLAB\AppData\Local\Programs\Tesseract-OCR",
    r"C:\Program Files\Tesseract-OCR",
    r"D:\Program Files\Tesseract-OCR",
]

TESSERACT_PATH = None
for candidate in TESSERACT_CANDIDATES:
    if os.path.exists(os.path.join(candidate, "tesseract.exe")):
        TESSERACT_PATH = candidate
        break

if not TESSERACT_PATH:
    TESSERACT_PATH = TESSERACT_CANDIDATES[0]  # Default fallback

TRAINING_DIR = "training_data"
OUTPUT_DIR = "output"
MODEL_NAME = "ph_id"
LANG = "eng"  # Base language to fine-tune from


def run_command(cmd):
    """Execute a command and return success/failure"""
    print(f"  → Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(f"    stdout: {result.stdout[:500]}")
    if result.returncode != 0:
        print(f"    ✗ Error (exit {result.returncode}): {result.stderr[:500]}")
        return False
    print(f"    ✓ Success")
    return True


def check_tools():
    """Verify that Tesseract and training tools are available"""
    print("=" * 60)
    print("TOOL CHECK")
    print("=" * 60)

    tools = ["tesseract", "lstmtraining", "combine_tessdata"]
    all_found = True
    for tool in tools:
        path = os.path.join(TESSERACT_PATH, tool + ".exe")
        if not os.path.exists(path):
            print(f"  ✗ MISSING: {tool} not found at {path}")
            all_found = False
        else:
            print(f"  ✓ Found: {tool}")

    # Check base traineddata
    traineddata = os.path.join(TESSERACT_PATH, "tessdata", f"{LANG}.traineddata")
    if os.path.exists(traineddata):
        size_mb = os.path.getsize(traineddata) / (1024 * 1024)
        print(f"  ✓ Base model: {traineddata} ({size_mb:.1f} MB)")
    else:
        print(f"  ✗ MISSING: {traineddata}")
        all_found = False

    # Check training data
    tif_count = len(glob.glob(os.path.join(TRAINING_DIR, "*.tif")))
    box_count = len(glob.glob(os.path.join(TRAINING_DIR, "*.box")))
    gt_count = len(glob.glob(os.path.join(TRAINING_DIR, "*.gt.txt")))
    print(f"\n  Training data in '{TRAINING_DIR}/':")
    print(f"    .tif files: {tif_count}")
    print(f"    .box files: {box_count}")
    print(f"    .gt.txt files: {gt_count}")

    # Check for matched pairs
    tif_bases = {os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(TRAINING_DIR, "*.tif"))}
    box_bases = {os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(TRAINING_DIR, "*.box"))}
    matched = tif_bases & box_bases
    print(f"    Matched .tif/.box pairs: {len(matched)}")

    if not matched:
        print("\n  ⚠  No matched .tif/.box pairs found. Run OCR scans first to generate training data.")

    if all_found:
        print("\n✓ All tools ready!")
    else:
        print("\n✗ Some tools are missing. Please install Tesseract with training tools.")

    return all_found


def validate_training_data():
    """Check that we have valid .tif/.box pairs before proceeding"""
    tif_files = glob.glob(os.path.join(TRAINING_DIR, "*.tif"))
    if not tif_files:
        print(f"✗ No .tif files in {TRAINING_DIR}/. Scan some IDs first via the OCR API.")
        return []

    valid_pairs = []
    for tif in tif_files:
        base = os.path.splitext(tif)[0]
        box_file = base + ".box"
        if os.path.exists(box_file):
            valid_pairs.append(tif)
        else:
            print(f"  ⚠  Skipping {os.path.basename(tif)} — no matching .box file")

    print(f"  Found {len(valid_pairs)} valid .tif/.box pairs")
    return valid_pairs


def prepare_lstmf():
    """Convert .tif/.box pairs to .lstmf files for LSTM training"""
    print("\n" + "=" * 60)
    print("STEP 1: Generating .lstmf files")
    print("=" * 60)

    valid_pairs = validate_training_data()
    if not valid_pairs:
        print("✗ No valid training pairs. Aborting.")
        return False

    success_count = 0
    for tif in valid_pairs:
        base = os.path.splitext(tif)[0]
        lstmf = base + ".lstmf"

        # Skip if already generated
        if os.path.exists(lstmf):
            print(f"  → Already exists: {os.path.basename(lstmf)}")
            success_count += 1
            continue

        cmd = [os.path.join(TESSERACT_PATH, "tesseract.exe"), tif, base, "lstm.train"]
        if run_command(cmd):
            success_count += 1

    print(f"\n  Generated {success_count}/{len(valid_pairs)} .lstmf files")
    return success_count > 0


def extract_base_model():
    """Extract the LSTM components from an existing .traineddata file"""
    print("\n" + "=" * 60)
    print("STEP 2: Extracting base LSTM model")
    print("=" * 60)

    traineddata = os.path.join(TESSERACT_PATH, "tessdata", f"{LANG}.traineddata")
    if not os.path.exists(traineddata):
        print(f"✗ {traineddata} not found.")
        print(f"  Download from: https://github.com/tesseract-ocr/tessdata_best")
        return False

    output_lstm = f"{MODEL_NAME}.lstm"
    if os.path.exists(output_lstm):
        print(f"  → Base model already extracted: {output_lstm}")
        return True

    cmd = [
        os.path.join(TESSERACT_PATH, "combine_tessdata.exe"),
        "-e", traineddata,
        output_lstm
    ]
    return run_command(cmd)


def start_training(max_iterations=400):
    """Run the LSTM fine-tuning loop"""
    print("\n" + "=" * 60)
    print(f"STEP 3: Training ({max_iterations} iterations)")
    print("=" * 60)

    # Build list of .lstmf files
    lstmf_files = glob.glob(os.path.join(TRAINING_DIR, "*.lstmf"))
    if not lstmf_files:
        print("✗ No .lstmf files found. Run --prepare first.")
        return False

    print(f"  Training with {len(lstmf_files)} samples")

    list_file = "list.train"
    with open(list_file, "w") as f:
        for fname in lstmf_files:
            f.write(fname + "\n")

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    lstm_file = f"{MODEL_NAME}.lstm"
    if not os.path.exists(lstm_file):
        print(f"✗ Base model {lstm_file} not found. Run --extract first.")
        return False

    cmd = [
        os.path.join(TESSERACT_PATH, "lstmtraining.exe"),
        "--model_output", os.path.join(OUTPUT_DIR, MODEL_NAME),
        "--continue_from", lstm_file,
        "--traineddata", os.path.join(TESSERACT_PATH, "tessdata", f"{LANG}.traineddata"),
        "--train_listfile", list_file,
        "--max_iterations", str(max_iterations),
    ]
    return run_command(cmd)


def finalize_model():
    """Combine checkpoint into final .traineddata"""
    print("\n" + "=" * 60)
    print("STEP 4: Finalizing model")
    print("=" * 60)

    checkpoint = os.path.join(OUTPUT_DIR, f"{MODEL_NAME}_checkpoint")
    if not os.path.exists(checkpoint):
        print(f"✗ Checkpoint not found: {checkpoint}")
        print(f"  Run --train first.")
        return False

    output_file = f"{MODEL_NAME}.traineddata"
    cmd = [
        os.path.join(TESSERACT_PATH, "lstmtraining.exe"),
        "--stop_training",
        "--continue_from", checkpoint,
        "--traineddata", os.path.join(TESSERACT_PATH, "tessdata", f"{LANG}.traineddata"),
        "--model_output", output_file
    ]

    if run_command(cmd):
        size_kb = os.path.getsize(output_file) / 1024 if os.path.exists(output_file) else 0
        print(f"\n✓ Model saved: {output_file} ({size_kb:.1f} KB)")
        print(f"  To use: copy {output_file} to {os.path.join(TESSERACT_PATH, 'tessdata', output_file)}")
        return True
    return False


def evaluate():
    """Run OCR on all training images and compare against ground truth"""
    print("\n" + "=" * 60)
    print("EVALUATION: Testing OCR accuracy on training data")
    print("=" * 60)

    gt_files = glob.glob(os.path.join(TRAINING_DIR, "*.gt.txt"))
    if not gt_files:
        print("✗ No ground truth files found.")
        return

    total_chars = 0
    correct_chars = 0
    total_files = 0

    for gt_file in gt_files:
        base = os.path.splitext(gt_file)[0].replace(".gt", "")
        tif_file = base + ".tif"

        if not os.path.exists(tif_file):
            continue

        # Read ground truth
        with open(gt_file, "r", encoding="utf-8") as f:
            gt_text = f.read().strip()

        if not gt_text:
            continue

        # Run OCR on the TIF
        try:
            import pytesseract
            from PIL import Image
            pytesseract.pytesseract.tesseract_cmd = os.path.join(TESSERACT_PATH, "tesseract.exe")
            ocr_text = pytesseract.image_to_string(Image.open(tif_file), config='--psm 6').strip()
        except Exception as e:
            print(f"  ✗ Error on {os.path.basename(tif_file)}: {e}")
            continue

        # Character-level accuracy
        gt_chars = list(gt_text.upper().replace(" ", "").replace("\n", ""))
        ocr_chars = list(ocr_text.upper().replace(" ", "").replace("\n", ""))

        matched = sum(1 for a, b in zip(gt_chars, ocr_chars) if a == b)
        file_total = max(len(gt_chars), len(ocr_chars))

        accuracy = (matched / file_total * 100) if file_total > 0 else 0
        total_chars += file_total
        correct_chars += matched
        total_files += 1

        print(f"  {os.path.basename(base)}: {accuracy:.1f}% ({matched}/{file_total} chars)")

    if total_chars > 0:
        overall = correct_chars / total_chars * 100
        print(f"\n  Overall accuracy: {overall:.1f}% across {total_files} files")
    else:
        print("  No files could be evaluated.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Tesseract LSTM Training Utility for Philippine ID Recognition",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python train_tesseract.py --check          Check tools and training data
  python train_tesseract.py --eval           Test current OCR accuracy
  python train_tesseract.py --all            Run full training pipeline
  python train_tesseract.py --train --max-iter 800   Train for 800 iterations
        """
    )
    parser.add_argument("--check", action="store_true", help="Check for required tools")
    parser.add_argument("--prepare", action="store_true", help="Generate .lstmf files from .tif/.box pairs")
    parser.add_argument("--extract", action="store_true", help="Extract base LSTM model")
    parser.add_argument("--train", action="store_true", help="Run LSTM training loop")
    parser.add_argument("--finalize", action="store_true", help="Create final .traineddata file")
    parser.add_argument("--eval", action="store_true", help="Evaluate OCR accuracy against ground truth")
    parser.add_argument("--all", action="store_true", help="Run full pipeline (prepare → extract → train → finalize)")
    parser.add_argument("--max-iter", type=int, default=400, help="Max training iterations (default: 400)")

    args = parser.parse_args()

    if args.check:
        check_tools()
    if args.eval:
        evaluate()
    if args.prepare or args.all:
        if not prepare_lstmf():
            sys.exit(1)
    if args.extract or args.all:
        if not extract_base_model():
            sys.exit(1)
    if args.train or args.all:
        if not start_training(args.max_iter):
            sys.exit(1)
    if args.finalize or args.all:
        if not finalize_model():
            sys.exit(1)

    if not any(vars(args).values()):
        parser.print_help()
