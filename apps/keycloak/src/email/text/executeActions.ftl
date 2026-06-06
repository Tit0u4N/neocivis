<#assign _townHallByClient = client?? && client.clientId == "neocivis-townhall-app">
<#assign _townHallByRole = false>
<#if user?? && user.realmRoleMappings??>
  <#list user.realmRoleMappings as _r>
    <#if (_r.name)?? && (_r.name == "ADMIN" || _r.name == "EMPLOYEE")>
      <#assign _townHallByRole = true>
    </#if>
  </#list>
</#if>
<#assign isTownHall = _townHallByClient || _townHallByRole>
<#if isTownHall>
NeoCivis — Municipal Portal
Change Your Password
<#else>
NeoCivis
Change Your Password
</#if>
================================

Hi ${user.firstName!user.username},

You requested to change your password on your NeoCivis<#if isTownHall> municipal</#if> account.

Click the link below to set a new password:

${link}

This link will expire in ${linkExpiration}.

If you did not request a password change, simply ignore this email — your account remains secure.

© ${.now?string("yyyy")} NeoCivis<#if isTownHall> — Municipal Portal</#if>
