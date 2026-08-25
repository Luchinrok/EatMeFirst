# =============================================================================
#  gen-icons.ps1 — regenera totes les icones de marca de Festuc
# =============================================================================
#
#  QUÈ GENERA (rasteritzant els dos SVG mestres d'/icons/):
#    icons/icon-192.png            192x192   any        <- festuc-icon-any.svg
#    icons/icon-512.png            512x512   any        <- festuc-icon-any.svg
#    icons/icon-maskable-192.png   192x192   maskable   <- festuc-icon-maskable.svg
#    icons/icon-maskable-512.png   512x512   maskable   <- festuc-icon-maskable.svg
#    icons/apple-touch-icon.png    180x180   iOS        <- variant maskable (fons pla)
#    favicon.ico                   16/32/48  pestanya   <- variant any (transparent)
#
#  PER QUÈ NO llegeix els .svg directament: aquesta màquina no té cap motor SVG
#  (ni ImageMagick, ni Inkscape, ni rsvg, ni cairosvg, ni Node). Per no dependre
#  de res, es replica AQUÍ la geometria dels masters amb GDI+ (System.Drawing):
#  l'el·lipse de la closca + les dues corbes de Bézier del fruit. Si edites els
#  SVG mestres, replica el canvi també aquí (transforms translate/scale i colors).
#
#  MÈTODE: es dibuixa cada variant en un llenç gran (2048 px, supermostreig) i es
#  redueix a cada mida amb interpolació bicúbica d'alta qualitat → antialiàsing
#  net fins i tot a 16 px.
#
#  COM EXECUTAR-LO (des de l'arrel del repo o d'on sigui):
#    pwsh -File tools/gen-icons.ps1        # o: powershell -File tools\gen-icons.ps1
#  Requereix Windows (GDI+/System.Drawing). No modifica cap SVG ni el manifest.
#
#  MASTERS (viewBox 0 0 512 512, festuc SENSE cara derivat de la mascota
#  d'index.html): any = translate(25,-8) scale(6.6), fons transparent;
#  maskable = translate(77.5,52) scale(5.1) sobre fons pla #FAFAF7, amb el dibuix
#  dins la zona segura del 80% perquè Android no el retalli.
# =============================================================================

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
# Arrel del repo = carpeta pare de tools/ (portable; no hardcodegis cap ruta).
$root  = if ($PSScriptRoot) { Split-Path $PSScriptRoot -Parent } else { (Get-Location).Path }
$icons = Join-Path $root 'icons'

function C([int]$r,[int]$g,[int]$b){ [System.Drawing.Color]::FromArgb(255,$r,$g,$b) }
$shellFill   = C 0xE7 0xD3 0xA8   # closca
$shellStroke = C 0xC9 0xA9 0x6A   # contorn closca
$fruitFill   = C 0x8C 0xBE 0x3F   # fruit
$fruitStroke = C 0x63 0x99 0x22   # contorn fruit / accent
$bgFlat      = C 0xFA 0xFA 0xF7   # fons pla del maskable (= --bg del projecte)

$SS = 2048                        # llenç de supermostreig
# ⚠️ BUG-1 (resolt): NO diguis a aquesta variable $G. Les variables de PowerShell
#    són CASE-INSENSITIVE, així que $G i la $g de [Graphics] serien la MATEIXA:
#    en crear el Graphics ($g) es carregaria l'escala i "2.5 * $s * $G" petaria
#    amb "does not contain a method named op_Multiply". Manté-la com $SCL.
$SCL = $SS / 512.0

function AddQuad($path,$p0,$c,$p1){
  # Bézier quadràtica (SVG "Q") -> cúbica (GDI+ AddBezier només fa cúbiques).
  $c1 = New-Object System.Drawing.PointF([single]($p0.X + 2.0/3.0*($c.X-$p0.X)), [single]($p0.Y + 2.0/3.0*($c.Y-$p0.Y)))
  $c2 = New-Object System.Drawing.PointF([single]($p1.X + 2.0/3.0*($c.X-$p1.X)), [single]($p1.Y + 2.0/3.0*($c.Y-$p1.Y)))
  $path.AddBezier($p0,$c1,$c2,$p1)
}

function Render-Variant([double]$tx,[double]$ty,[double]$s,$bg){
  $bmp = New-Object System.Drawing.Bitmap($SS,$SS,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode   = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  if($bg){ $g.Clear($bg) } else { $g.Clear([System.Drawing.Color]::Transparent) }

  # map: coord original del master -> píxel del llenç 2048 (aplica transform + SS).
  $map = { param($x,$y) New-Object System.Drawing.PointF([single]((($tx + $s*$x))*$SCL), [single]((($ty + $s*$y))*$SCL)) }
  $sw = [single](2.5 * $s * $SCL)   # gruix d'stroke del master (2.5) escalat

  # --- closca: el·lipse (bbox original x5..65 y3..77) ---
  $tl = & $map 5 3
  $rectEll = New-Object System.Drawing.RectangleF($tl.X, $tl.Y, [single](60*$s*$SCL), [single](74*$s*$SCL))
  $g.FillEllipse((New-Object System.Drawing.SolidBrush($shellFill)), $rectEll)
  $g.DrawEllipse((New-Object System.Drawing.Pen($shellStroke,$sw)), $rectEll)

  # --- fruit: path tancat, omplert + contornat ---
  $fruit = New-Object System.Drawing.Drawing2D.GraphicsPath
  $fruit.StartFigure()
  AddQuad $fruit (& $map 10 22) (& $map 24 34) (& $map 35 33)
  AddQuad $fruit (& $map 35 33) (& $map 46 34) (& $map 60 22)
  AddQuad $fruit (& $map 60 22) (& $map 55 52) (& $map 46 66)
  AddQuad $fruit (& $map 46 66) (& $map 40 74) (& $map 35 75)
  AddQuad $fruit (& $map 35 75) (& $map 30 74) (& $map 24 66)
  AddQuad $fruit (& $map 24 66) (& $map 15 52) (& $map 10 22)
  $fruit.CloseFigure()
  $g.FillPath((New-Object System.Drawing.SolidBrush($fruitFill)), $fruit)
  $penFruit = New-Object System.Drawing.Pen($fruitStroke,$sw)
  $penFruit.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $g.DrawPath($penFruit,$fruit)

  # --- accent: contorn superior de l'obertura (path obert, extrems arrodonits) ---
  $div = New-Object System.Drawing.Drawing2D.GraphicsPath
  $div.StartFigure()
  AddQuad $div (& $map 10 22) (& $map 24 34) (& $map 35 33)
  AddQuad $div (& $map 35 33) (& $map 46 34) (& $map 60 22)
  $penDiv = New-Object System.Drawing.Pen($fruitStroke,$sw)
  $penDiv.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penDiv.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawPath($penDiv,$div)

  $g.Dispose()
  return $bmp
}

function New-Scaled($master,[int]$size){
  $out = New-Object System.Drawing.Bitmap($size,$size,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($out)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  # TileFlipXY evita el "fantasma" de vora en reduir molt (2048 -> 16).
  $ia = New-Object System.Drawing.Imaging.ImageAttributes
  $ia.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
  $rect = New-Object System.Drawing.Rectangle(0,0,$size,$size)
  $g.DrawImage($master,$rect,0,0,$master.Width,$master.Height,[System.Drawing.GraphicsUnit]::Pixel,$ia)
  $g.Dispose()
  return $out
}

function Save-Png($master,[int]$size,$path){
  $out = New-Scaled $master $size
  $out.Save($path,[System.Drawing.Imaging.ImageFormat]::Png)
  $out.Dispose()
}

function Build-Ico($master,[int[]]$sizes,$path){
  # ⚠️ BUG-2 (resolt): usa una List[byte[]], NO "$pngs += $bytes". L'operador +=
  #    de PowerShell CONCATENA element a element, així que aplanaria cada byte[]
  #    als seus bytes individuals; després $pngs[$i].Length donava 1/0 i les
  #    longituds del directori ICO sortien corruptes (el fitxer semblava bo però
  #    cap navegador el podia llegir). List[byte[]].Add() manté cada PNG sencer.
  $pngs = New-Object 'System.Collections.Generic.List[byte[]]'
  foreach($s in $sizes){
    $out = New-Scaled $master $s
    $mem = New-Object System.IO.MemoryStream
    $out.Save($mem,[System.Drawing.Imaging.ImageFormat]::Png)
    $out.Dispose()
    $pngs.Add($mem.ToArray())
    $mem.Dispose()
  }
  # Contenidor ICO: ICONDIR (6 B) + N x ICONDIRENTRY (16 B) + els PNG concatenats.
  $ms = New-Object System.IO.MemoryStream
  $bw = New-Object System.IO.BinaryWriter($ms)
  $bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]$sizes.Count)
  $offset = 6 + 16*$sizes.Count
  for($i=0;$i -lt $sizes.Count;$i++){
    $s=$sizes[$i]; $len=$pngs[$i].Length
    $dim = if($s -ge 256){0}else{$s}            # 0 = 256 en el format ICO
    $bw.Write([byte]$dim); $bw.Write([byte]$dim); $bw.Write([byte]0); $bw.Write([byte]0)
    $bw.Write([uint16]1); $bw.Write([uint16]32); $bw.Write([uint32]$len); $bw.Write([uint32]$offset)
    $offset += $len
  }
  foreach($p in $pngs){ $bw.Write($p) }
  $bw.Flush()
  [System.IO.File]::WriteAllBytes($path,$ms.ToArray())
  $bw.Dispose(); $ms.Dispose()
}

# --- masters (mateixos transforms que els SVG d'/icons/) ---
$anyMaster  = Render-Variant 25   -8 6.6 $null      # a sang, transparent
$maskMaster = Render-Variant 77.5 52 5.1 $bgFlat    # zona segura 80%, fons pla

Save-Png $anyMaster  512 (Join-Path $icons 'icon-512.png')
Save-Png $anyMaster  192 (Join-Path $icons 'icon-192.png')
Save-Png $maskMaster 512 (Join-Path $icons 'icon-maskable-512.png')
Save-Png $maskMaster 192 (Join-Path $icons 'icon-maskable-192.png')
Save-Png $maskMaster 180 (Join-Path $icons 'apple-touch-icon.png')
Build-Ico $anyMaster @(16,32,48) (Join-Path $root 'favicon.ico')

Write-Output "GENERATS. Verificacio de dimensions:"
$files = @(
  (Join-Path $icons 'icon-192.png'),
  (Join-Path $icons 'icon-512.png'),
  (Join-Path $icons 'icon-maskable-192.png'),
  (Join-Path $icons 'icon-maskable-512.png'),
  (Join-Path $icons 'apple-touch-icon.png')
)
foreach($f in $files){
  $img = [System.Drawing.Image]::FromFile($f)
  "{0,-32} {1}x{2}  {3}bpp  {4:N0} B" -f (Split-Path $f -Leaf), $img.Width, $img.Height, [System.Drawing.Image]::GetPixelFormatSize($img.PixelFormat), (Get-Item $f).Length
  $img.Dispose()
}
$bytes = [System.IO.File]::ReadAllBytes((Join-Path $root 'favicon.ico'))
$cnt = [BitConverter]::ToUInt16($bytes,4)
$dims = @(); for($i=0;$i -lt $cnt;$i++){ $w=$bytes[6+16*$i]; $dims += $(if($w -eq 0){256}else{$w}) }
"{0,-32} entrades: {1}  mides: {2}  {3:N0} B" -f 'favicon.ico', $cnt, ($dims -join '/'), $bytes.Length

$anyMaster.Dispose(); $maskMaster.Dispose()
