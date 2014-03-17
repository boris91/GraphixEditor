<%@ Page Language="C#" AutoEventWireup="true" CodeFile="default.aspx.cs" Inherits="_default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>Graphics editor</title>
	<script type="text/javascript" src="code/base/GL.js" onload="GL.initialize({ window: window, userIdentity: 'user' });"></script>
</head>
<body>
    <form id="form1" runat="server">
    <div id="totalLayer" class="forTotalLayer">
    </div>
    </form>
</body>
</html>
